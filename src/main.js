import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('form');
const loadBtn = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';

import { getImagesByQuery } from './js/pixabay-api';
import {
  showLoader,
  hideLoader,
  clearGallery,
  createGallery,
  showLoadMoreBtn,
  hideLoadMoreBtn,
} from './js/render-functions';

form.addEventListener('submit', async e => {
  e.preventDefault();
  clearGallery();
  hideLoadMoreBtn();
  showLoader();

  const input = e.currentTarget.elements['search-text'].value.trim();

  if (!input) {
    hideLoader();
    return iziToast.error({
      title: 'Error',
      message:
        'Sorry, there are no images matching your search query. Please try again!',
      position: 'topRight',
    });
  }

  currentQuery = input;
  currentPage = 1;
  getImagesByQuery(currentQuery, currentPage)
    .then(res => {
      if (res.hits.length === 0) {
        return iziToast.error({
          title: 'Error',
          message:
            'Sorry, there are no images matching your search query. Please try again!',
          position: 'topRight',
        });
      }

      createGallery(res.hits);

      if (res.totalHits > currentPage * 15) {
        showLoadMoreBtn();
      } else {
        hideLoadMoreBtn();
      }
    })
    .catch(err => {
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
    })
    .finally(() => {
      hideLoader();
      form.reset();
    });
});

loadBtn.addEventListener('click', async () => {
  currentPage += 1;
  showLoader();

  try {
    const res = await getImagesByQuery(currentQuery, currentPage);
    createGallery(res.hits);

    if (res.totalHits <= currentPage * 15) {
      hideLoadMoreBtn();
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }

    const firstCard = document.querySelector('.gallery').firstElementChild;
    if (firstCard) {
      const { height: cardHeight } = firstCard.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
  } catch {
    iziToast.error({
      title: 'Error',
      message: 'Failed to load more images.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
});
