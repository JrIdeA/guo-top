export default function(sagas) {
  return function* rootSaga()  {
    yield sagas;
  }
}