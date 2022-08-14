const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + '/api/v1/movies'
const POSTER_URL = BASE_URL + '/posters/'
// creat a blank array to put all movies
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))||[]

const datapanel = document.querySelector('#data-panel')

function renderMovieList(data) {
  let rawHTML = ''

  //運用forEach將item一個一個代入函式
  data.forEach((item) => {
    //need title img
    //button 新增 dataset   data-id = ${item.id}
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger text-white btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`

  })

  datapanel.innerHTML = rawHTML
}

//顯示小視窗內容的函式，依id number判斷
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  //串接API，拿取特定id中的資料
  axios.get(INDEX_URL + '/' + id).then(response => {
    //response.data.results
    const data = response.data.results
    console.log(data)
    modalTitle.innerText = data.title
    modalDate.innerText = `Release Date: ${data.release_date}`
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })

}

function removeFromFavorite(id) {
  // findindex() 回傳找到元素的位置
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return

  movies.splice(movieIndex,1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}

//click MORE and +
datapanel.addEventListener('click', function onPanelclicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    //console.log(event.target.dataset)會得到 某id的整個物件
    // 物件下id會用string顯示，需轉換成數字
    showMovieModal(Number(event.target.dataset.id))
    //當按下收藏按鈕時
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})
renderMovieList(movies)
