client_id = 146431

initial_url = `http://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read_all`


const authlink = "https://www.strava.com/oauth/token?"

function openInNewTab() {
  window.open(initial_url, '_blank').focus();
}



function getActivities(res){

  const activities_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${res.access_token}`
  fetch(activities_link)
      .then((res) => console.log(res.json()))

}


function reAuthorise(){
  fetch(authlink,{
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id : '146431',
      client_secret : 'fa8f1dba14db96de096814962beaaee40779ebb6',
      refresh_token : '63429733aca2481c8f5ea6037852e24c25cf93a6',
      grant_type : 'refresh_token',
    })
  }).then(res => res.json())
      .then(res => getActivities(res))

}

reAuthorise()