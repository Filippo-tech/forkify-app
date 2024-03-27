//making the application work

import * as model from './model.js';

import { MODAL_CLOSE_SEC } from './config.js';

import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import addrecipeView from './views/addrecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import paginationView from './views/paginationView.js';

// if (module.hot) {
//   module.hot.accept();
// }

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
// addrecipeView._addHandlerShowWindow();

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();
    // 0) aggiorna la results view per marcare la ricetta selezionata
    resultsView.update(model.getSearchResultsPage());
    // aggiorna la lista dei bookmark
    bookmarksView.update(model.state.bookmarks);
    //1) loading recipe
    await model.loadRecipe(id);
    console.log(model.state.recipe);
    // 2) rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // Ottieni il query
    const query = searchView.getQuery();
    if (!query) return;

    // Ottieni le informazioni della ricetta (immagazzinate in model.state.recipe.results)
    await model.loadSearchResults(query);
    // mostri le ricette
    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);

    // mostri i bottoni per cambiare pagina
    // paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  // mostri le NUOVE ricette
  resultsView.render(model.getSearchResultsPage(goToPage));

  // mostri i NUOVI bottoni per cambiare pagina
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // il newServings è definito in recipeView
  // aggiorno ingredienti nella recipe dello state
  model.updateServings(newServings);
  // mostro le nuove quantità degli ingredienti
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // ADD and REMOVE bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // Aggiorna la ricetta
  recipeView.update(model.state.recipe);
  //Mostra i bookmarks
  bookmarksView.render(model.state.bookmarks); // in qesuto caso render= true
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addrecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);

    addrecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function () {
      addrecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addrecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addrecipeView.addHandlerUpload(controlAddRecipe);
};
init();
