import { sagas as sagasGame } from '../pages/Game';

export default function* rootSaga()  {
  yield [
    ...sagasGame,
  ];
}