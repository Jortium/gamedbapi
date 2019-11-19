function fetchAPI(queryItems) {
	const params = {
		// search: $('.search-param').val(),
		// genres: $('.genre-param').val(),
		// platforms: $('.platforms-param').val(),
		// publishers: $('.publishers-param').val(),
		page_size: '1'
	};
	let baseURL = 'https://api.rawg.io/api/games';
	const queryString = formatParams(params);
	let url = `${baseURL}?${queryString}`;
	console.log(url);
	fetch(`${url}`)
		.then(response => response.json())
		.then(responseJson => displayResults(responseJson))
		.catch(error => {
			console.log(`Something went wrong: ${error.message}`);
		});
}

function formatParams(params) {
	const queryItems = Object.keys(params).map(
		key => `${key}=${params[key]}`
	);
	console.log(queryItems);
	return queryItems.join('&');
}

function displayResults(responseJson) {
	for (let i = 0; i < responseJson.results.length; i++) {
		let metacritic =.text();
		$(`#home-list`).append(`
		<li>
			<h1>${responseJson.results[i].name}</h1>
			<h3>${metacritic}</h3>
			</li>`);
	}
}

fetchAPI();
