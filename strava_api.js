// Gets the value for an element by its id and converts it to a string
function getDetails(detail) {
  const clientdetail = document.getElementById(detail).value;
  return String(clientdetail);
}

//Changes the users access to read all using client id
function setReadAll() {
  clientidurl = getDetails("clientid");
  readall_url = `http://www.strava.com/oauth/authorize?client_id=${clientidurl}&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read_all`;
  if (clientidurl.length > 1) {
    window.open(readall_url);
    document.getElementById("stageone").style.display = "none";
    document.getElementById("stagetwo").style.display = "block";
  } else {
    document.getElementById("clientiderror").style.display = "block";
    document.getElementById("clientiderror").innerHTML =
      "Please enter a valid Client ID";
  }
  console.log("Authorisation window opened to authenticate");
}

const authlink = "https://www.strava.com/oauth/token?";

let activitiesData = [];
var per_page = 200;
var attempts = 20; 

//Runs last and gets the activities
function getActivities(res) {
    try {
      const fetchPromises = [];
      for (let counter = 1; counter < attempts; counter++) {
        console.log(`Accessing page ${counter} of user activities`);
        const activities_link = `https://www.strava.com/api/v3/athlete/activities?page=${counter}&per_page=${per_page}&access_token=${res.access_token}`;
        fetchPromises.push(
          fetch(activities_link)
            .then((res) => res.json())
            .then((data) => {
              parseActivities(data);
              getTotal(data);
            })
        );
      }
      //Waits for all fetch requests to complete before loading map page
      Promise.all(fetchPromises).then(() => {
        localStorage.setItem("distances", distances);
        localStorage.setItem("elevations", elevations);
        localStorage.setItem("activities", activities);
        console.log("All activities fetched and stored");
        window.location.href = "map.html";
      });
    } catch {
      if (attempts != 1) { 
      per_page = Round(per_page / 2);
      attempts = attempts * 2;
      console.log("Records returned reduced");
      attempt_count = attempt_count + 1;
      reAuthorise();
      } else {
        document.getElementById("loading").style.color = "red";
        document.getElementById("loading").innerHTML =
        "An error occured, your Strava data is not compatible with this app, please submit feedback";
        console.log("Records became too small, fetch failed");
      }
  }
}

//Authorises the user based off their details provided, uses authorisation code method
function reAuthorise() {
  document.getElementById("loading").style.color = "#ef591e";
  document.getElementById("loading").innerHTML = "Loading...";
  document.getElementById("loading").style.display = "block";
  const userclientid = clientidurl;
  const userclientsecret = getDetails("clientsecret");
  const usercode = getDetails("code");
  fetch(authlink, {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: userclientid,
      client_secret: userclientsecret,
      code: usercode,
      grant_type: "authorization_code",
    }),
  }).then((res) => {
    if (res.ok) {
      res.json().then((res) => getActivities(res));
    } else {
      document.getElementById("loading").style.color = "red";
      document.getElementById("loading").innerHTML =
        "An error occured, please check details and try again";
      console.log("Error message displayed, fetch failed");
    }
  });
}

routes = [];
var cookieCounter = 1;

//Decodes JSON into polylines stored in cookie
function parseActivities(data) {
  for (const item of data) {
    polyline = item["map"]["summary_polyline"];
    decoded_line = polyline;
    if (decoded_line && decoded_line.length > 0) {
      routes.push(decoded_line);
    }
  }

  localStorage.setItem(`scratchmap_routes${cookieCounter}`, JSON.stringify(routes));
  cookieCounter = cookieCounter + 1;
}

//Straight redirect to map page for use when cookie present
function pickUp() {
  window.location.href = "map.html";
}

var distances = 0;
var elevations = 0;
var activities = 0;

//Gets statistics from JSON and stores these in cookies
function getTotal(data) {
  for (const item of data) {
    distance_single = Number(item["distance"]);
    distances = distances + distance_single;
  }
  for (const item of data) {
    elevation_single = Number(Math.round(item["total_elevation_gain"]));
    elevations = elevations + elevation_single;
    activities = activities + 1;
  }
}
