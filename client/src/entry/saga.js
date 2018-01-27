// import { sagas as sagasHome } from '../pages/Home';
// import { sagas as sagasGame} from '../pages/Game';
import { sagas as sagasRank} from '../pages/Rank';

export default function* rootSaga()  {
  yield [
    ...sagasRank,
  ];
}