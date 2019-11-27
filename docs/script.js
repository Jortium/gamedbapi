let trackResults = 0;
let gameResponse;

const params = {
	...($('.id-param').val() && {
		page: $('.id-param').val()
	}),
	page_size: '12',
	parent_platforms: '1,2,3,5,6,7'
	// ...($('.search-param').val() && {
	// 	search: $('.search-param').val()
	// }),
	// ...($('.genre-param').val() && {
	// 	genres: $('.genre-param').val()
	// }),
	// ...($('.platforms-param').val() && {
	// 	platforms: $('.platforms-param').val()
	// }),
	// ...($('.id-param').val() && {
	// 	publishers: $('.id-param').val()
	// }),
	// dates: '2019-11-01,2019-11-24',
	// ordering: '-rating',
};

function formatParams(params) {
	const queryItems = Object.keys(params).map(
		key => `${key}=${params[key]}`
	);
	console.log(queryItems);
	return queryItems.join('&');
}

const opts = {
	headers: {
		'User-Agent': `<ClassProject> / <VER 0.01> <Currently in Alpha testing>`
	}
};

const baseURL = 'https://api.rawg.io/api/games';
const queryString = formatParams(params);
let url = `${baseURL}?${queryString}`;
console.log(url);

function fetchGames() {
	fetch(`${url}`, opts)
		.then(response => response.json())
		.then(responseJson => {
			gameResponse = responseJson;
			displayResults(responseJson);
		})
		.catch(error => {
			console.log(`Something went wrong: ${error.message}`);
		});
}

function displayResults(responseJson) {
	console.log(responseJson);
	const gamedata = responseJson.results.map(game => {
		return {
			//single item
			name: game.name,
			released: game.released,
			consoles: game.platforms,
			id: game.id,
			//multiple items
			score: game.metacritic,
			genre: game.genres,
			store: game.stores,
			images: game.short_screenshots
		};
	});
	console.log(gamedata);
	inputData(gamedata);
}

function inputData(gamedata) {
	let info = ' ';
	gamedata.forEach(input => {
		info += `<li class = "game-card">`;
		info += `<div class= "game-border">`;
		info += `<a class="game-name" href='https://api.rawg.io/api/games/${input.id}'>${input.name}</a >`;
		info += `<br><br><span class="game-rating">Metacritic: ${input.score ||
			'No metacritic rating available'}</span>`;
		info += `<br><span>Platforms:`;
		input.consoles.forEach(e => {
			info += ` ${e.platform.name} </span>`;
		});
		// info += `<div class="image-container">`;
		// input.images.forEach(function(f) {
		// 	info += `<img src=${f.image} class="game-image">`;
		// });
		// info += `</div>`;
		info += `</div>`;
		info += `</li>`;
	});
	$('#card-list').html(info);
}

function pageLoad() {
	$(document).ready(function() {
		fetchGames();
	});
}

function initializeListeners() {
	pageLoad();
}

$(initializeListeners());
