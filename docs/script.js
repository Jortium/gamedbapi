// This will generate the dates needed to fit critera.
function appendZeroes(n) {
  if (n <= 9) {
    return '0' + n;
  }
  return n;
}

function generateDate() {
  let date = new Date();
  let present =
    date.getFullYear() +
    '-' +
    appendZeroes(date.getMonth() + 1) +
    '-' +
    appendZeroes(date.getDate());
  let postdate = new Date(new Date().setDate(date.getDate() + 1825));
  let future =
    postdate.getFullYear() +
    '-' +
    appendZeroes(postdate.getMonth() + 1) +
    '-' +
    appendZeroes(postdate.getDate());
  return `${present},${future}`;
}

// Parameters to filter results.
const params = {
  // Permanent Params
  ordering: 'released',
  parent_platforms: '2,3,6,7',
  page_size: '25',
  // Adjustable Params
  dates: generateDate()
};

// Take params set from above and format them into workable URL to fetch data.
function formatParams(params) {
  const queryItems = Object.keys(params).map(key => `${key}=${params[key]}`);
  return queryItems.join('&');
}

// Per requirements of RAWG's API usage they want only a user-agent header.
const opts = {
  headers: {
    'User-Agent':
      '<ClassProject> / <VER 2.00> <Updated for smoother experience.>'
  }
};

// API will load page then based will continue to add a page as long as there is one to be generated.
let pageNum = 1;
// Halts multiple instances of infinite scroll to a controlled single page.
let loading = false;

// Using the page number and the formatted params generated above it will create a URL.
function generateURL(game) {
  const baseURL = 'https://api.rawg.io/api/games';
  if (game) {
    params.search = game;
  }
  const queryString = formatParams(params);
  const url = `${baseURL}?page=${pageNum}&${queryString}`;
  return url;
}

// With URL generated it will make a request based on the URL above and bring it into a workable JSON file.
function fetchGames(game) {
  fetch(generateURL(game), opts)
    .then(response => response.json())
    .then(responseJson => {
      if (responseJson.results.length > 0) {
        mapResults(responseJson);
      } else {
        $('.noresults').append('<p class="wompwomp">No results found.</div>');
      }
    });
}

// The results from the fetch end up here to be mapped and changed in to a workable array list.
function mapResults(responseJson) {
  let gamedata;
  if (responseJson && responseJson.results) {
    gamedata = responseJson.results.map(game => ({
      // single item
      name: game.name,
      slug: game.slug,
      id: game.id,
      // multiple items
      platform: game.platforms,
      genre: game.genres,
      video: game.clip,
      date: game.released,
      detailsURL: `https://api.rawg.io/api/games/${game.id}`
    }));
    inputData(gamedata);
  }
}

// Then that array list ends up here for client side visability.
function inputData(gamedata) {
  gamedata.forEach(input => {
    let formatDate = input.date;
    formatDate = formatDate.split('-').map(e => (e[0] == '0' ? e.slice(1) : e));
    formatDate = formatDate[1] + '/' + formatDate[2] + '/' + formatDate[0];
    let info = '';
    $('.web-list').append(`<li class = "game-card ${input.slug}-card"></li>`);
    info += '<div class= "game-border">';
    info += `<a class="url-name"><h2><p class= "game-name" id="${input.id}" data-url="${input.detailsURL}">${input.name}</p></h2></a>`;
    info += '<div class="game-space"></div>';
    if (input.video === null) {
      info += '<div class=no-clip>No clips here yet!</div>';
      info += '<div class="game-space"></div>';
      info += `<div class=released><span><b>Release Date</b>: ${formatDate}`;
      $(`#${input.slug}-card`).append(info);
      return undefined;
    }
    const result = Object.keys(input.video).map(key => [
      Number(key),
      input.video[key]
    ]);
    const videolink = result[1][1];
    info += ` <div class= "game-clip">
    <video width="220" height="124" controls>
      <source src=" ${videolink.full}" type="video/mp4">
    Your browser does not support the video tag.
    </video>
    </div>`;
    info += '<div class="game-space"></div>';
    info += `<div class=released><span><b>Release Date</b>: ${formatDate}`;
    $(`.${input.slug}-card`).append(info);
  });
  loading = false;
  $('.noresults').empty();
  $(`ul li:empty`).remove();
  $('.noresults').append(
    `<p class="wompwomp">No additional results found.</p>`
  );
  detailedModal();
}

async function secondFetch(detailsURL) {
  let res;
  res = await fetch(detailsURL, opts)
    .then(detailedResponse => detailedResponse.json())
    .then(detailedResponseJson => {
      return detailedResponseJson;
    });
  return res;
}

function detailedModal() {
  $('.game-name').click(async function() {
    let data = await secondFetch($(this).attr('data-url'));
    $('.modal').fadeIn();
    $('body').css(`overflow`, `hidden`);
    $('.modal').css(`overflow`, `auto`);
    populateModal(data);
  });
}

async function populateModal(data) {
  let moreinfo = '';
  moreinfo += `<div class="modal-header"><span class="close">&times;</span><div class="modal-title"><h2>${data.name}<h2></div></div>`;
  moreinfo += `<div class="modal-body"><span class="gametext">Genres: `;
  let i;
  for (i = 0; i < data.genres.length; i++) {
    moreinfo += `${data.genres[i].name} `;
  }
  moreinfo += `<br>Platforms: `;
  let ii;
  for (ii = 0; ii < data.platforms.length; ii++) {
    moreinfo += `${data.platforms[ii].platform.name} `;
  }
  moreinfo += `<br><a class='youtubeLink' href='https://www.youtube.com/watch?v=${data.clip.video}'>Full Video Preview</a>`;
  moreinfo += `<br><br>${data.description}<br></span></div>`;
  await $('.detailed-modal').html(moreinfo);
  $('.detailed-modal').css(
    `background-image`,
    ` linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url("${data.background_image}")`
  );
  closeModal();
}

function closeModal() {
  $('.close').click(() => {
    $('.modal-title').empty();
    $('.modal-body').empty();
    $('.modal-footer').empty();
    $('.modal').fadeOut();
    $('body').css(`overflow`, `auto`);
    $('.modal').css(`overflow`, `hidden`);
  });
}

function openNav() {
  $('.fa-bars').click(() => {
    $('.navList').width(`250px`);
    $('body').css(`overflow`, `none`);
  });
}

function closeNav() {
  $('.closebtn').click(() => {
    $('.modal-title').empty();
    $('.modal-body').empty();
    $('.modal-footer').empty();
    $('.navList').width(`0px`);
    $('body').css(`overflow`, `auto`);
  });
}

function aboutNav() {
  $('.aboutModal').click(() => {
    $('.modal').fadeIn();
    $('body').css(`overflow`, `hidden`);
    $('.modal').css(`overflow`, `auto`);
    $('.detailed-modal').css(
      `background-image`,
      ` linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://i.imgur.com/O6DCBv8.jpg")`
    );
    $('.modal-header').append(`<h1>About The Next Game</h1>`);
    $('.modal-body').append(`
      <span>Welcome to my API based webpage! This website is to see upcoming game previews.
      <br>
      <br>
      Q: What is the purpose of this site?
      <br>
      A: Purely just to view future upcoming games all in one place. I have disincluded PC games from this as... well it really opens up a flood gate. I might consider making another version of this with just PC games.
      <br>
      <br>
      Q: Who is the host of this database?
      <br>
      A: RAWG which can be <a class="youtubeLink" href="https://api.rawg.io/docs/">located here.</a>
      <br>
      <br>
      Q: What language is this written in?
      <br>
      A: HTML5, CSS3, JavaScript using jQuery library.
      <br>
      <br>
      Q: Why is there no full video clips embeded?
      <br>
      A: This is actually a security measure placed by YouTube which only allows links to be used for the full video. Links can be found
      in the modal.
      <br>
      <br>
      Q: What inspired you to do this webpage?
      <br>
      A: Self-interest and futher my growth and knowledge of coding!
      <br>
      <br>
      API Legal Notice
      <br>
We do not claim ownership of any of the images or data provided by the API. 
We remove infringing content when properly notified. 
Any data and/or images one might upload to RAWG is expressly granted a license to use. 
You are prohibited from using the images and/or data in connection with libelous, defamatory, 
obscene, pornographic, abusive or otherwise offensive content.
      </span>`);
  });
  closeModal();
}

function contactNav() {
  $('.contactModal').click(() => {
    $('.modal').fadeIn();
    $('body').css(`overflow`, `hidden`);
    $('.modal').css(`overflow`, `auto`);
    $('.detailed-modal').css(
      `background-image`,
      ` linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://i.imgur.com/O6DCBv8.jpg")`
    );
    $('.modal-header').append(`<p><h1>Contact Info</h1></p>`);
    $('.modal-body').append(`
    Feel free to click any of the icons seen here to reach out to me!
      <ul class='contactcontainer'>
        <li class='hoverover'>
          <a href='mailto:joshwortiz@gmail.com' target='_top'>
            <img src='images/email.png' class='contactinfo' alt='Email Icon' />
          E-Mail
            </a>
        </li>
        <li class='hoverover'>
          <a href='#' target='_blank'>
            <img
              src='images/webpage.png'
              class='contactinfo'
              alt='Website Icon'
            />
            Portfolio
          </a>
        </li>
        <li class='hoverover'>
          <a href='https://github.com/OrtizJosh' target='_blank'>
            <img
              src='images/github.png'
              class='contactinfo'
              alt='GitHub Icon'
            />
            Github
          </a>
        </li>
        <li class='hoverover'>
          <a
            href='https://www.linkedin.com/in/joshua-ortiz-188745184/'
            target='_blank'
          >
            <img
              src='images/linkedin.png'
              class='contactinfo'
              alt='LinkedIn Icon'
            />
            Linkedin
          </a>
        </li>
      </ul>
    `);
  });
  closeModal();
}

// Check to ensure where the user is on the page. If they have reached  a point it will fetch more data from the next page.
function infiniteScroll() {
  $(window).scroll(function() {
    if ($(document).height() - $(this).height() - 1000 < $(this).scrollTop()) {
      if (!loading) {
        pageNum++;
        loading = true;
        fetchGames();
      }
    }
  });
}

// On inital load of the document initalize the data fetch.
function pageLoad() {
  $(document).ready(() => {
    fetchGames();
  });
}

// The search tool will clear current data reset the page to 1 then fetch the data.
function pageLoadClick() {
  $('.search-games').submit(e => {
    $('.navList').width(`0px`);
    $('.noresults').empty();
    $('.web-list').empty();
    e.preventDefault();
    if (params.search) {
      delete params.search;
    }
    const searchParam = $('.search-param').val();
    pageNum = 1;
    fetchGames(searchParam);
  });
}

function desktopLoadClick() {
  $('.desktop-games').submit(e => {
    $('.web-list').empty();
    $('.noresults').empty();
    e.preventDefault();
    if (params.search) {
      delete params.search;
    }
    const searchParam = $('.desktop-param').val();
    pageNum = 1;
    fetchGames(searchParam);
  });
}

// A function to tell the browser what to initalize.
function initializeListeners() {
  pageLoad();
  infiniteScroll();
  pageLoadClick();
  desktopLoadClick();
  openNav();
  closeNav();
  aboutNav();
  contactNav();
}

// Initalize the initalizer.
initializeListeners();
