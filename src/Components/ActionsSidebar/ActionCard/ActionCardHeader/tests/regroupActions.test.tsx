import type { Action } from '../../../../../hooks/hooks.types'
import type { SetupPoolsAction } from '../ActionCardHeaderButtons.util'
import { regroupActions } from '../ActionCardHeaderButtons.util'

import {
  actions as actions1,
  myActions as myActions1,
  pendingSubmissions as pendingSubmissions1,
} from './data/regroupActions.data1'
import {
  actions as actions2,
  myActions as myActions2,
  pendingSubmissions as pendingSubmissions2,
} from './data/regroupActions.data2'
import {
  actions as actions3,
  myActions as myActions3,
  pendingSubmissions as pendingSubmissions3,
} from './data/regroupActions.data3'
import {
  actions as actions4,
  myActions as myActions4,
  pendingSubmissions as pendingSubmissions4,
} from './data/regroupActions.data4'
import {
  actions as actions5,
  myActions as myActions5,
  pendingSubmissions as pendingSubmissions5,
} from './data/regroupActions.data5'
import {
  actions as actions6,
  myActions as myActions6,
  pendingSubmissions as pendingSubmissions6,
} from './data/regroupActions.data6'

describe('regroupActions()', () => {
  test('regroupActions() dataset 1', () => {
    expect(
      regroupActions({
        myActions: myActions1 as unknown as Action[],
        pendingSubmissions: pendingSubmissions1 as unknown as SetupPoolsAction[],
      }),
    ).toEqual(actions1)
  })

  test('regroupActions() dataset 2', () => {
    expect(
      regroupActions({
        myActions: myActions2 as unknown as Action[],
        pendingSubmissions: pendingSubmissions2 as unknown as SetupPoolsAction[],
      }),
    ).toEqual(actions2)
  })

  test('regroupActions() dataset 3', () => {
    expect(
      regroupActions({
        myActions: myActions3 as unknown as Action[],
        pendingSubmissions: pendingSubmissions3 as unknown as SetupPoolsAction[],
      }),
    ).toEqual(actions3)
  })

  test('regroupActions() dataset 4', () => {
    expect(
      regroupActions({
        myActions: myActions4 as unknown as Action[],
        pendingSubmissions: pendingSubmissions4 as unknown as SetupPoolsAction[],
      }),
    ).toEqual(actions4)
  })
  test('regroupActions() dataset 5', () => {
    expect(
      regroupActions({
        myActions: myActions5 as unknown as Action[],
        pendingSubmissions: pendingSubmissions5 as unknown as SetupPoolsAction[],
      }),
    ).toEqual(actions5)
  })
  test('regroupActions() dataset 6', () => {
    expect(
      regroupActions({
        myActions: myActions6 as unknown as Action[],
        pendingSubmissions: pendingSubmissions6 as unknown as SetupPoolsAction[],
      }),
    ).toEqual(actions6)
  })
})
