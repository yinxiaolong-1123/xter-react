

let SERVER_ENV = "dev";

if (window.location.host === "avengers.ovopark.com") {
  SERVER_ENV = "pro";
} else if (window.location.host === "avengers.wandianzhang.com") {
  SERVER_ENV = "dev";
} else {
  SERVER_ENV = "person";
}


const authParams = {
    person: 'http://172.16.3.192:8849',
    dev: 'http://avengers-do01.ovopark.com',
    pro: 'http://avengers-do01.ovopark.com'
};


export const path = authParams[SERVER_ENV]