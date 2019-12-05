function parameterButton() {
	$('#game-filters-closed').click(function() {
		$('#parameters').slideToggle();
	});
}

function platformButton() {
	$('#platform-button').click(function() {
		$('#platform-container').slideToggle();
	});
}

function genreButton() {
	$('#genre-button').click(function() {
		$('#genre-container').slideToggle();
	});
}
function contactButton() {
	$('#contact-button').click(function() {
		$('#contact-container').slideToggle();
	});
}

//This will generate the dates needed to make
function generateDate() {
	let date = new Date();
	let present =
		date.getFullYear() +
		'-' +
		(date.getMonth() + 1) +
		'-' +
		date.getDate();
	let predate = new Date(new Date().setDate(date.getDate() + 366));
	let past =
		predate.getFullYear() +
		'-' +
		(predate.getMonth() + 1) +
		'-' +
		predate.getDate();
	return `${past},${present}`;
}

const params = {
	//Permanent Params
	parent_platforms: '2,3,6,7',
	page_size: '10',
	//Adjustable Params
	genres: $(`input[type=checkbox][name=genre]:checked`).val(),
	platforms: $(`input[type=checkbox][name=platform]:checked`).val(),
	// dates: generateDate(),
	ordering: '-released'
};
console.log('Parameter Check', params);

//Take params set from above and format them into workable URL to fetch data.
function formatParams(params) {
	const queryItems = Object.keys(params).map(
		key => `${key}=${params[key]}`
	);
	return queryItems.join('&');
}

//Per requirements of RAWG's API usage they want only a user-agent header.
const opts = {
	headers: {
		'User-Agent': `<ClassProject> / <VER 0.02> <Currently in Alpha testing>`
	}
};

//API will load 12 per page then based on the next function will continue to add a page to progress load.
let pageNum = 1;
let loading = false;

//Using the page number and the formatted params generated above it will create a URL.
function generateURL(game) {
	let baseURL = `https://api.rawg.io/api/games`;
	if (game) {
		params.search = game;
	}
	const queryString = formatParams(params);
	let url = `${baseURL}?page=${pageNum}&${queryString}`;
	return url;
}

//This will send a request based on the URL above and bring it into a workable JSON data file to work with.
function fetchGames(game) {
	fetch(generateURL(game), opts)
		.then(response => response.json())
		.then(responseJson => {
			mapResults(responseJson);
		})
		.catch(error => {
			console.log(`Something went wrong: ${error.message}`);
		});
	console.log('Page Check', pageNum);
}

//The results from the fetch end up here to be mapped and changed in to a workable array list.
function mapResults(responseJson) {
	const gamedata = responseJson.results.map(game => {
		return {
			//single item
			name: game.name,
			//multiple items
			platform: game.platforms,
			genre: game.genres
			// video: game.clip
		};
	});
	// console.log(gamedata);
	inputData(gamedata);
	liveFilter(gamedata);
}

function inputData(gamedata) {
	let info = '';
	gamedata.forEach(input => {
		info += `<li class = "game-card">`;
		info += `<div class= "game-border">`;
		// info += `<div class= "game-clip">`;
		// input.video.forEach(a => {
		// 	info += `<video width="320" height="240" controls>
		//  <source src="${a.clips.full}" type="video/mp4">
		// Your browser does not support the video tag.
		// </video>`;
		// });
		// info += `</div>`;
		info += `<div class= "game-name">${input.name}</div>`;
		info += `<br><span>Platforms:`;
		input.platform.forEach(b => {
			info += ` ${b.platform.name}`;
		});
		info += `</span>`;
		info += `<br><br>`;
		info += `<span>Genres:`;
		input.genre.forEach(c => {
			info += ` ${c.name} `;
		});
		info += `</span>`;
		info += `</li>`;
		info += `</div>`;
	});
	$('#card-list').append(info);
	loading = false;
}

function liveFilter(gamedata) {
	// Declare variables
	let platform = '';
	gamedata.forEach(function(select) {
		select.consoles.forEach(function(find) {
			platform += find.platform.id;
		});
	});
	$('input[type=checkbox][name=platform]').click(function() {
		$('.game-card').hide();
		$('input[type=checkbox][name=platform]:checked').each(
			function() {
				$('.platform')
					.val()
					.show();
			}
		);
	});
}

/*The data gathered above is brought here to 
be changed into something that will appear on the client end for viewing.*/

/*Check to ensure where the user is on the page. If they have reached 
a point it will fetch more data from the next page.*/
function infiniteScroll() {
	$(window).scroll(function() {
		if (
			$(document).height() - $(this).height() - 350 <
			$(this).scrollTop()
		) {
			if (!loading) {
				pageNum++;
				loading = true;
				fetchGames();
			}
		}
	});
}

//On inital load of the document initalize the data fetch.
function pageLoad() {
	$(document).ready(function() {
		fetchGames();
	});
}

function pageLoadClick() {
	$('.search-games').submit(function(e) {
		e.preventDefault();
		if (params.search) {
			delete params.search;
		}
		const searchParam = $('.search-param').val();
		$('#card-list').empty();
		$('#parameters').slideToggle();
		pageNum = 1;
		fetchGames(searchParam);
	});
}

//A function to tell the browser what to initalize.
function initializeListeners() {
	pageLoad();
	infiniteScroll();
	parameterButton();
	genreButton();
	contactButton();
	platformButton();
	pageLoadClick();
}

//Initalize the initalizer.
initializeListeners();
