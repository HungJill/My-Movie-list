const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + '/api/v1/movies'
const POSTER_URL = BASE_URL + '/posters/'
//分頁使用
const MOVIES_PER_PAGE = 12 
// creat a blank array to put all movies
const movies = []
// create a blank array for searched movies
let filterMovie = []
let currentPage = 1

const datapanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeChange = document.querySelector('#mode-change')


// render Movie by cards
function renderMovieByCard(data) {
  let rawHTML = ''
  //運用forEach將item一個一個代入函式
  data.forEach((item) => {
    //need title img
    //button 新增 dataset   data-id = ${item.id}
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class=" btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info text-white btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`

  })
  datapanel.innerHTML = rawHTML
}

// render Movie by lists (data will be an array)
function renderMovieByList (data) {
  let rawHTML=''
  rawHTML += `<ul class="list-group list-group-flush">`
  data.forEach((item) => {
    rawHTML += `    
    <li class="list-group-item d-flex">
      <h6 class="list-title me-auto p-2 align-self-center">${item.title}</h6>
      <button class="btn btn-primary m-2 btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
      <button class="btn btn-info text-white m-2 btn-add-favorite" data-id="${item.id}">+</button>
    </li>`
  })
  rawHTML += `</ul>`
  datapanel.innerHTML = rawHTML 
}

//render分頁器專用
function renderPaginator(amount){
  //Math.ceil 無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML =''
  for (let page = 1; page <= numberOfPages; page++){
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }                   // ↑ 同樣在超連結A綁定dataset
  paginator.innerHTML = rawHTML
}

//分頁函式，目標: 輸入page時，可以回傳該page有哪12部電影
function getMoviesByPage(page){
  // data.slice 取代 movies.slice
  // movies? movies  all / movies-filter  filterMovies   ?=條件運算子
  // IF [filterMovies]內有元素為true，data為filterMovies，反之，data為movies
  const data = filterMovie.length ? filterMovie : movies
  //PAGE 1: movies 0-11
  //PAGE 2: movies 12-23
  //PAGE 3: movies 24-35...
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
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

// 加入我的最愛
function addToFavorite(id) {
  //function isMovieIdMatched(movie){
  //當movie.id = 參數id
  //  return movie.id === id
  //} 在下方改寫為箭頭函式
  //JSON.parse將取出字串轉為物件
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單中')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 模式轉換後，return到該模式渲染頁面
function currentMode (content) {
  const cardMode = document.querySelector('.btn-show-card')
  if (cardMode.classList.contains('active')) {
    return renderMovieByCard(content)
  } else {
    return renderMovieByList(content)
  }
}

//click MORE and +
datapanel.addEventListener('click', function onPanelclicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    //console.log(event.target.dataset)會得到 某id的整個物件
    // 物件下id會用string顯示，需轉換成數字
    showMovieModal(Number(event.target.dataset.id))
    //當按下收藏按鈕時
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// click paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果點擊的不是 'A' 這個超連結，這個函式就不要了 
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  currentPage = page
  currentMode(getMoviesByPage(currentPage))
})

// click mode-change
modeChange.addEventListener('click', function onModeClicked(event) {
  const target = event.target
  const modeNow = document.querySelector('#mode-change .active')
  const mode = event.target.dataset.mode
  if (modeNow) {
    modeNow.classList.remove("active");
  }
  if (mode === 'card'){
    target.classList.add('active')
    renderMovieByCard(getMoviesByPage(currentPage))
  } else if (mode === 'list') {
    target.classList.add('active')
    renderMovieByList(getMoviesByPage(currentPage))
  }
})

//submit searchForm 
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // avoid reload 請瀏覽器不要做預設動作，將UI控制權交給js
  event.preventDefault()
  // 取 input 值，轉換成小寫
  const keyword = searchInput.value.trim().toLowerCase()
  
  //若input有輸入string，!keyword.length一定是false，故若無輸入就會是true
  // if(!keyword.length){
  //    return alert(' please enter a valid string')
  //}

  //array.filter(條件函式)
  filterMovie = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filterMovie.length === 0) {
    return alert(`Cannot find movies with ${keyword}`)
  }
  
  //迴圈法搜尋
  //若搜尋到就放進fiterMovie中
  // for(const movie of movies){
  //  if(movie.title.toLowerCase().includes(keyword)){
  //    filterMovie.push(movie)
  //  }
  //}
    currentPage = 1
    renderPaginator(filterMovie.length)
    currentMode(getMoviesByPage(currentPage))

})
//串接主API
axios.get(INDEX_URL).then(response => {
  //Array(80)
  //for (const movie of response.data.results){
  //  movies.push(movie)
  //}
  //展開運算式，可取代for 迴圈將電影送進電影陣列
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  //預設顯示第一頁的資料
  renderMovieByCard(getMoviesByPage(1))
})

