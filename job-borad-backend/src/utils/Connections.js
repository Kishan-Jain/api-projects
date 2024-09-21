/**
 * check user is connected : for check connection, make disconnect, chatBox ativities etc
 */

export const CheckUserConected = async (firstUser, secondUserId) => {
  /**
   * chack first user and second userId is received
   * reterive frist user connection list
   * match second user id in this list
   * return result in true or false
   */
  if(![firstUser, secondUserId].some(field => field)){

  }
  return await (firstUser.connectionsWithEmployees.find(connection => connection?.EmployeeId?.toString() === secondUserId ) || firstUser.connectionsWithCandidates.find(connection => connection?.CandidateId?.toString() === secondUserId ))
}


