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

function fetchGames() {
	const params = {
		...($('.search-param').val() && {
			search: $('.search-param').val()
		}),
		...($('.genre-param').val() && {
			genres: $('.genre-param').val()
		}),
		...($('.platforms-param').val() && {
			platforms: $('.platforms-param').val()
		}),
		...($('.publishers-param').val() && {
			develpors: $('.publishers-param').val()
		}),
		...($('.id-param').val() && {
			publishers: $('.id-param').val()
		}),
		page_size: '5'
	};

	console.log(params);

	const baseURL = 'https://api.rawg.io/api/games';
	const queryString = formatParams(params);
	let url = `${baseURL}?${queryString}`;

	console.log(url);

	fetch(`${url}`, opts)
		.then(response => response.json())
		.then(responseJson => displayResults(responseJson))
		.catch(error => {
			console.log(`Something went wrong: ${error.message}`);
		});
}

function displayResults(responseJson) {
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
	let html = '';
	gamedata.forEach(input => {
		html += `<li class = "game-card">`;
		html += `<div class= "game-border">`;
		html += `<a class="game-name" href='https://api.rawg.io/api/games/${input.id}'>${input.name}</a >`;
		html += `<br><br><span class="game-rating">Metacritic: ${input.score ||
			'No metacritic rating available'}</span>`;
		html += `<br><span>Platforms:`;
		input.consoles.forEach(e => {
			html += ` ${e.platform.name} </span>`;
		});
		// html += `<div class="image-container">`;
		// input.images.forEach(function(f) {
		// 	html += `<img src=${f.image} class="game-image">`;
		// });
		// html += `</div>`;
		html += `</div>`;
		html += `</li>`;
	});
	$(`#card-list`).html(html);
}

function pageLoad() {
	$(document).ready(function() {
		fetchGames();
	});
}

pageLoad();
