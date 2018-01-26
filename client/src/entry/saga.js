import { sagas as sagasHome } from '../pages/Home';

export default function* rootSaga()  {
  yield [
    ...sagasHome,
  ];
}