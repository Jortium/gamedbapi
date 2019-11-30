let params = {
	page_size: '12',
	// parent_platforms: '1,2,3,5,6,7',
	// ...($('.search-param').val() && {
	// 	search: $('.search-param').val()
	// }),
	// ...($('.genre-param').val() && {
	// 	genres: $('.genre-param').val()
	// }),
	// ...($('.platforms-param').val() && {
	// 	platforms: $('.platforms-param').val()
	// }),
	platforms: $(`input[type=checkbox][name=platform]:checked`).val()
	// ...($('.id-param').val() && {
	// 	publishers: $('.id-param').val()
	// })
	// dates: '2019-11-01,2019-11-24',
	// ordering: '-rating',
};

console.log(params);

function generateDate() {
	let today = new Date();
	let dd = String(today.getDate()).padStart(2, '0');
	let mm = String(today.getMonth() + 1).padStart(2, '0');
	let yyyy = today.getFullYear();
	today = yyyy + '/' + mm + '/' + dd;
}

function formatParams(params) {
	const queryItems = Object.keys(params).map(
		key => `${key}=${params[key]}`
	);
	console.log(queryItems);
	return queryItems.join('&');
}

const opts = {
	headers: {
		'User-Agent': `<ClassProject> / <VER 0.02> <Currently in Alpha testing>`
	}
};

let pageNum = 0;

function generateURL() {
	pageNum++;
	let baseURL = `https://api.rawg.io/api/games`;
	const queryString = formatParams(params);
	let url = `${baseURL}?page=${pageNum}&${queryString}`;
	console.log(pageNum);
	return url;
}

function fetchGames() {
	fetch(generateURL(), opts)
		.then(response => response.json())
		.then(responseJson => {
			displayResults(responseJson);
		})
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
	// fetchGameID(gamedata);
}

// function fetchGameID(gamedata) {
// 	gamedata.forEach(url => {
// 		const idurl = `https://api.rawg.io/api/games/${url.id}`;
// 		fetch(idurl, opts)
// 			.then(secondary => secondary.json())
// 			.then(secondaryJson => {
// 				inputData(secondaryJson);
// 			})
// 			.catch(error => {
// 				console.log(
// 					`Something went wrong: ${error.message}`
// 				);
// 			});
// 	});
// }

// function inputGameID(secondaryJson) {
// 	console.log(secondaryJson);
// 	const moredata = secondaryJson.forEach(sole => {
// 		return {
// 			title: sole.name,
// 			description: sole.description
// 		};
// 	});
// }

function inputData(gamedata) {
	let info = '';
	gamedata.forEach(input => {
		info += `<li class = "game-card">`;
		info += `<div class= "game-border">`;
		info += `<div class= "game-name">${input.name}</div>`;
		// info += `<div class="overlay">`;
		// info += `${input.title}`;
		// info += `${input.genre}`;
		// info += `${input.store}`;
		// info += `</div>`;
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
	$('#card-list')
		.fadeIn()
		.append(info);
}

function infiniteScroll() {
	$(window).scroll(function() {
		// End of the document reached?
		if (
			$(document).height() - $(this).height() ===
			$(this).scrollTop()
		) {
			fetchGames();
		}
	});
}

function pageLoad() {
	$(document).ready(function() {
		fetchGames();
	});
}

function initializeListeners() {
	pageLoad();
	infiniteScroll();
}

$(initializeListeners());
