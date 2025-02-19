function getDetails (detail) {
  const clientdetail = document.getElementById(detail).value;
  return String(clientdetail)
}

function setReadAll() {
  clientidurl = getDetails('clientid'),
  readall_url = `http://www.strava.com/oauth/authorize?client_id=${clientidurl}&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read_all`
  window.open(readall_url);
  document.getElementById('stageone').style.display = 'none';
  document.getElementById('stagetwo').style.display = 'block';
}

const authlink = "https://www.strava.com/oauth/token?"

function getActivities(res){

  const activities_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${res.access_token}`
  fetch(activities_link)
      .then((res) => console.log(res.json()))

}

function reAuthorise(){
  const userclientid = clientidurl
  console.log(userclientid)
  const userclientsecret = getDetails('clientsecret')
  console.log(userclientsecret)
  const usercode = getDetails('code')
  console.log(usercode)
  fetch(authlink,{
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id : userclientid,
      client_secret : userclientsecret,
      code : usercode,
      grant_type : 'authorization_code',
    })
  }).then(res => res.json())
      .then(res => getActivities(res))
}

function submitDetails(){
      
      reAuthorise()

}












