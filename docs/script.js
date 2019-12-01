function generateDate() {
	let date = new Date();
	let present =
		date.getFullYear() +
		'-' +
		(date.getMonth() + 1) +
		'-' +
		date.getDate();
	let predate = new Date(new Date().setDate(date.getDate() - 30));
	let past =
		predate.getFullYear() +
		'-' +
		(predate.getMonth() + 1) +
		'-' +
		predate.getDate();
	return `${past},${present}`;
}

console.log(generateDate());

const params = {
	//Permanent Params
	parent_platforms: '2,3,7',
	page_size: '10',
	//Adjustable Params
	// ...($('.search-param').val() && {
	// 	search: $('.search-param').val()
	// }),
	// 	genres: $(`.genre input[type=checkbox][name=genre]:checked`).val().change(function () {
	// 		if ($(".genre input:checkbox:checked").length > 0)
	// 	}
	// 		()
	// {

	// }
	// }),
	// 	platforms: $(`input[type=checkbox][name=platform]:checked`).val(),
	dates: generateDate(),
	ordering: '-rating'
};

console.log(params);

//Take params set from above and format them into workable URL to fetch data.
function formatParams(params) {
	const queryItems = Object.keys(params).map(
		key => `${key}=${params[key]}`
	);
	console.log(queryItems);
	return queryItems.join('&');
}

//Per requirements of RAWG's API usage they want only a user-agent header.
const opts = {
	headers: {
		'User-Agent': `<ClassProject> / <VER 0.02> <Currently in Alpha testing>`
	}
};

//API will load 12 per page then based on the next function will continue to add a page to progress load.
let pageNum = 0;

//Using the page number and the formatted params generated above it will create a URL.
function generateURL() {
	pageNum++;
	let baseURL = `https://api.rawg.io/api/games`;
	const queryString = formatParams(params);
	let url = `${baseURL}?page=${pageNum}&${queryString}`;
	console.log(pageNum);
	return url;
}

//This will send a request based on the URL above and bring it into a workable JSON data file to work with.
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

//The results from the fetch end up here to be mapped and changed in to a workable array list.
function displayResults(responseJson) {
	const gamedata = responseJson.results.map(game => {
		return {
			//single item
			name: game.name,
			released: game.released,
			consoles: game.platforms,
			id: game.id,
			//multiple items
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

/*The data gathered above is brought here to 
be changed into something that will appear on the client end for viewing.*/
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
	$('#card-list').append(info);
}

/*Check to ensure where the user is on the page. If they have reached 
a point it will fetch more data from the next page.*/
function infiniteScroll() {
	$(window).scroll(function() {
		if (
			$(document).height() - $(this).height() ===
			$(this).scrollTop()
		) {
			fetchGames();
		}
	});
}

//On inital load of the document initalize the data fetch.
function pageLoad() {
	$(document).ready(function() {
		fetchGames();
	});
}

//A function to tell the browser what to initalize.
function initializeListeners() {
	pageLoad();
	infiniteScroll();
}

//Initalize the initalizer.
initializeListeners();
