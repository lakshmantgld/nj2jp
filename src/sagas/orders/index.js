import { call, put, take } from 'redux-saga/effects';
import apiActions from '../../redux/api';
import orderActions, { orderTypes } from '../../redux/orders';
import sagawaApi from '../../services/api/sagawa';


export default function* validatePostal() {
  while(true) { //eslint-disable-line
    const { postal } = yield take(orderTypes.VALIDATE_POSTAL_CODE);
    const responses = yield [
      put(apiActions.fetching()),
      call(() => sagawaApi.validatePostal(postal)),
    ];
    console.log('%cSAGAWA POSTAL RESPONSE', 'background:lime;', responses[1]);

    const { ok, problem, data } = cleanSagawaResponse.postal(responses[1]);

    if (ok) {
      yield [
        put(apiActions.apiSuccess()),
        put(orderActions.receivedValidPostal(data)),
      ];
    } else {
      yield put(apiActions.apiFail(problem));
    }
  }
}