//Buttons to allow expand and collapse buttons.
function parameterButton() {
	$('#game-filters').click(function() {
		$('#parameters').slideToggle();
		$('.param-container').slideUp();
		$('.button-text').empty();
		if ($('.button-text').is('.menu-closed')) {
			$('.button-text')
				.addClass('menu-open')
				.removeClass('menu-closed')
				.append(`Close Filters`);
		} else {
			$('.button-text')
				.addClass('menu-closed')
				.removeClass('menu-open')
				.append(`Open Filters`);
		}
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

function disclosureButton() {
	$('#disclosure-button').click(function() {
		$('#disclosure-container').slideToggle();
	});
}

//This will generate the dates needed to fit critera.
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

//Parameters to filter results.
const params = {
	//Permanent Params
	parent_platforms: '2,3,6,7',
	page_size: '10',
	//Adjustable Params
	// genres: $(`input[type=checkbox][name=genre]:checked`).val()
	platforms: $(`input[type=checkbox][name=platform]:checked`).val()
	// dates: generateDate(),
	// ordering: '-released'
};
console.log('Parameter Check', params);

// $('.platform-list').click(function() {
// 	if ($(`input[type=checkbox][name=platform]:checked`).length) {
// 		$('#platform-all').attr('checked', true);
// 	} else {
// 		$('#platform-all').attr('checked', false);
// 	}
// });

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
		'User-Agent': `<ClassProject> / <VER 0.09> <Currently in Alpha testing>`
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
			video: game.clip
		};
	});
	console.log(gamedata);
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
			info += `<br><div class=no-clip>No preview was found.</div>`;
			info += `<span><b>Platforms</b>: `;
			input.platform.forEach(b => {
				info += `${b.platform.name} `;
			});
			info += `</span>`;
			info += `<div class="game-space"></div>`;
			info += `<span><b>Genres</b>:`;
			input.genre.forEach(c => {
				info += `${c.name} `;
			});
			info += `</span>`;
			$(`#${input.slug}-card`).append(info);
			const currentGame = $(`#${input.slug}-card`);
			input.platform.forEach(b => {
				$(currentGame).addClass(`pzz${b.platform.id}`);
			});
			input.genre.forEach(c => {
				$(currentGame).addClass(`gzz${c.id}`);
				console.log('!!!!!!!!!!!!!!!!', currentGame);
			});
			return undefined;
		}
		let result = Object.keys(input.video).map(function(key) {
			return [Number(key), input.video[key]];
		});
		let videolink = result[1][1];
		info += ` <div class= "game-clip">
		<video width="280" height="158" controls>
  		<source src=" ${videolink.full}" type="video/mp4">
		Your browser does not support the video tag.
		</video>
		</div>`;
		info += `<div class="game-space"></div>`;
		info += `<span><b>Platforms</b>: `;
		input.platform.forEach(b => {
			info += `${b.platform.name} `;
		});
		info += `</span>`;
		info += `<div class="game-space"></div>`;
		info += `<span><b>Genres</b>: `;
		input.genre.forEach(c => {
			info += `${c.name} `;
		});
		info += `</span>`;
		info += `</div>`;
		$(`#${input.slug}-card`).append(info);
		let currentGame = $(`#${input.slug}-card`);
		input.platform.forEach(b => {
			$(currentGame).addClass(`${b.platform.id}pm`);
		});
		input.genre.forEach(c => {
			$(currentGame).addClass(`${c.id}ge`);
		});
	});
	loading = false;
}

function filterByPlatform() {
	$('#platform-container').submit(e => {
		e.preventDefault();
		liveFilter();
	});
}

//Based on checkboxs clicked this will hide games that do not fit the critera of the parameters.
function liveFilter(gamedata) {
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
	disclosureButton();
	pageLoadClick();
}

//Initalize the initalizer.
initializeListeners();
