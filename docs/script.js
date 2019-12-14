//This will generate the dates needed to fit critera.
function generateDate() {
	let date = new Date();
	let present =
		date.getFullYear() +
		'-' +
		(date.getMonth() + 1) +
		'-' +
		date.getDate();
	let postdate = new Date(new Date().setDate(date.getDate() + 1825));
	let future =
		postdate.getFullYear() +
		'-' +
		(postdate.getMonth() + 1) +
		'-' +
		postdate.getDate();
	return `${present},${future}`;
}

//Parameters to filter results.
const params = {
	//Permanent Params
	parent_platforms: '2,3,6,7',
	page_size: '20',
	//Adjustable Params
	dates: generateDate(),
	ordering: '-added'
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

//API will load page then based will continue to add a page as long as there is one to be generated.
let pageNum = 1;
//Halts multiple instances of infinite scroll to a controlled single page.
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

//With URL generated it will make a request based on the URL above and bring it into a workable JSON file.
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
			slug: game.slug,
			//multiple items
			platform: game.platforms,
			genre: game.genres,
			video: game.clip,
			date: game.released
		};
	});
	inputData(gamedata);
}

//Then that array list ends up here for client side visability.
function inputData(gamedata) {
	gamedata.forEach(input => {
		let info = '';
		$('#card-list').append(
			`<li class = "game-card" id="${input.slug}-card"></li>`
		);
		info += `<div class= "game-border">`;
		info += `<div class= "game-name">${input.name}</div>`;
		info += `<div class="game-space"></div>`;
		if (input.video === null) {
			info += `<div class=no-clip>No clips here yet!</div>`;
			info += `<div class=released><span><b>Release Date</b>: ${input.date} `
			info += `<div class="game-space"></div>`;
			info += `<div class=platforms><span><b>Platforms</b>: `;
			input.platform.forEach(b => {
				info += `${b.platform.name} `;
			});
			info += `</span></div>`;
			info += `<div class="game-space"></div>`;
			info += `<span><b>Genres</b>:`;
			input.genre.forEach(c => {
				info += ` ${c.name} `;
			});
			info += `</span>`;
			$(`#${input.slug}-card`).append(info);
			return undefined;
		}
		let result = Object.keys(input.video).map(function(key) {
			return [Number(key), input.video[key]];
		});
		let videolink = result[1][1];
		let videolink2 = result[2][1]
		console.log(videolink2)
		info += ` <div class= "game-clip">
		<video width="280" height="158" controls>
  		<source src=" ${videolink.full}" type="video/mp4">
		Your browser does not support the video tag.
		</video>
		</div>`;
		info += `<div class="game-space"></div>`;
		info += `<div class="videolink"><a href=https://www.youtube.com/embed/${videolink2}>See the full video</a></div>`
		info += `<div class="game-space"></div>`;
		info += `<div class=released><span><b>Release Date</b>: ${input.date} </span></div>`
		info += `<div class="game-space"></div>`;
		info += `<span><b>Platforms</b>: `;
		input.platform.forEach(b => {
			info += `${b.platform.name} `;
		});
		info += `</span>`;
		info += `<div class="game-space"></div>`;
		info += `<span><b>Genres</b>: `;
		input.genre.forEach(c => {
			info += ` ${c.name} `;
		});
		info += `</span>`;
		info += `</div>`;
		$(`#${input.slug}-card`).append(info);
		});
	loading = false;
}


//Check to ensure where the user is on the page. If they have reached  a point it will fetch more data from the next page.
function infiniteScroll() {
	$(window).scroll(function() {
		if (
			$(document).height() - $(this).height() - 600 <
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

//The search tool will clear current data reset the page to 1 then fetch the data.
function pageLoadClick() {
	$('.search-games').submit(function(e) {
		e.preventDefault();
		if (params.search) {
			delete params.search;
		}
		const searchParam = $('.search-param').val();
		$('#card-list').empty();
		pageNum = 1;
		fetchGames(searchParam);
	});
}

//A function to tell the browser what to initalize.
function initializeListeners() {
	pageLoad();
	infiniteScroll();
	pageLoadClick();
}

//Initalize the initalizer.
initializeListeners();
