const searchBox = document.querySelector("#searchBox");
const monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayArr = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const darArrShort = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const timeArr = [12,1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11];
const dl_card_arr = document.querySelectorAll('.dl-card');
const hr_card_arr = document.querySelectorAll('.hr-card');

navigator.geolocation.getCurrentPosition((position)=>{
    updateWeatherInfo(position.coords.latitude, position.coords.longitude);
},
(error)=>{
    alert("Location access denied. Couldn't fetch weather report of user location.");
});

document.querySelector(".searchButton").addEventListener('click',()=>{
    if(searchBox.value != ""){
        locationInfo(searchBox.value);
        document.querySelector(".searchButton").disabled = true;
    }
});

async function locationInfo(address){
    let url_g = "https://nominatim.openstreetmap.org/search?format=json&limit=3&q=" + address;
    const locationData = await fetch(url_g)
        .then((response) => {
            return response.json();
        })
        .then((data)=>{
            return data;
        })
        .catch((error)=>{
            alert(error);
        })

        if(locationData.length > 0){
            updateWeatherInfo(locationData[0].lat, locationData[0].lon, locationData[0].display_name);
        }
        else{
            alert("Location not found. Please check the entered address or spelling.");
            document.querySelector(".searchButton").disabled = false;
        }
}

async function updateWeatherInfo(latitude,longitude,locationAddress){
    let url_w = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=b41ce65d85c1a3e2f0b86e2d19fd4b5a&units=metric`
    const weatherData = await fetch(url_w)
        .then((response)=>{
            return response.json();
        })
        .then((data)=>{
            return data;
        })
        .catch((error)=>{
            alert(error);
        })
    console.log(weatherData);
    updateBgImg(weatherData.list[0]);
    document.querySelector(".searchButton").disabled = false;
    document.querySelector('.forecast_box').style.display = "block";
    if(locationAddress == null)
        document.querySelector(".location-address").innerHTML = `<i class="bi bi-geo-alt-fill" style="color: orangered;"></i> &nbsp;${weatherData.city.name}, ${weatherData.city.country}`;
    else
        document.querySelector(".location-address").innerHTML = `<i class="bi bi-geo-alt-fill" style="color: orangered;"></i> &nbsp;${locationAddress}`;
    document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${weatherData.list[0].weather[0].icon}@2x.png`;
    document.querySelector('.weather-description').innerText = weatherData.list[0].weather[0].description;
    document.querySelector('.temperature').innerText = Math.round(weatherData.list[0].main.temp) + "°C";
    document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(weatherData.list[0].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(weatherData.list[0].main.temp_min)}°C`;
    document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(weatherData.list[0].main.feels_like)}°C`;
    document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(weatherData.list[0].wind.speed)} m/s`;
    document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(weatherData.list[0].main.humidity)}%`;
    document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${weatherData.list[0].main.pressure} hPa`;

    for(let i=0; i<6; i++){
        dl_card_arr[i].style.background = "none";
    }
    for(let i=0; i<6; i++){
        hr_card_arr[i].style.background = "none";
    }
    dl_card_arr[0].style.background = "rgba(255,255,255,0.2)";
    hr_card_arr[0].style.background = "rgba(255,255,255,0.2)";

    let date_data = new Date(weatherData.list[0].dt*1000);
    let day = date_data.getDay();
    let month = date_data.getMonth();
    let date = date_data.getDate();
    let year = date_data.getFullYear();
    document.querySelector('.day').innerText = dayArr[day];
    document.querySelector('.date').innerHTML = `<i class="bi bi-calendar3"></i> &nbsp;${monthArr[month]} ${date}, ${year}</p>`;
    
    let arr = (weatherData.list[0].dt_txt).split(' ');
    let time = (arr[1]).split(':');
    if(parseInt(time[0]) < 12)
        document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[parseInt(time[0])]} AM`;
    else
        document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[parseInt(time[0])]} PM`;
    // updating all hourly cards using the loop below...
    for(let i=0; i<6; i++){
       let today_date = weatherData.list[i].dt_txt[8] + weatherData.list[i].dt_txt[9];
       let hourly_time = weatherData.list[i].dt_txt[11] + weatherData.list[i].dt_txt[12];
       let am_pm;
       if(parseInt(hourly_time) < 12)
            am_pm = 'AM';
       else
            am_pm = 'PM';
       if(parseInt(today_date) == date){
            hr_card_arr[i].style.visibility = "visible";
            hr_card_arr[i].innerHTML = `
                <p id="hr-time-1" class="hr-time">${timeArr[parseInt(hourly_time)]} ${am_pm}</p>
                <img src="https://openweathermap.org/img/wn/${weatherData.list[i].weather[0].icon}@2x.png" id="hr-icon-1" class="hr-icon">
                <p id="hr-temp-1" class="hr-temp">${Math.round(weatherData.list[i].main.temp)}°C</p>
                <p id="hr-description-1" class="hr-description">${weatherData.list[i].weather[0].main}</p>`
       }
       else{
            hr_card_arr[i].style.visibility = "hidden";
       }   
    }

    updateForecastDetails(weatherData);
}

function updateForecastDetails(weatherData){
    let arrDate0=[], arrDate1=[], arrDate2=[], arrDate3=[], arrDate4=[], arrDate5=[];
    let baseDt = parseInt(weatherData.list[0].dt_txt[8] + weatherData.list[0].dt_txt[9]);
    // loop for grouping different date datas into different array
    for(let i=0; i<weatherData.list.length; i++){
        if(parseInt(weatherData.list[i].dt_txt[8] + weatherData.list[i].dt_txt[9]) == baseDt){
            arrDate0.push(weatherData.list[i]);
            if(parseInt(weatherData.list[i+1].dt_txt[8] + weatherData.list[i+1].dt_txt[9]) == 1 && parseInt(arrDate0[0].dt_txt[8] + arrDate0[0].dt_txt[9]) != 1)
                baseDt = 0;
        }
        else if(parseInt(weatherData.list[i].dt_txt[8] + weatherData.list[i].dt_txt[9]) == (baseDt+1)){
            arrDate1.push(weatherData.list[i]);
            if(parseInt(weatherData.list[i+1].dt_txt[8] + weatherData.list[i+1].dt_txt[9]) == 1 && parseInt(arrDate1[0].dt_txt[8] + arrDate1[0].dt_txt[9]) != 1)
                baseDt = -1;
        }
        else if(parseInt(weatherData.list[i].dt_txt[8] + weatherData.list[i].dt_txt[9]) == (baseDt+2)){
            arrDate2.push(weatherData.list[i]);
            if(parseInt(weatherData.list[i+1].dt_txt[8] + weatherData.list[i+1].dt_txt[9]) == 1 && parseInt(arrDate2[0].dt_txt[8] + arrDate2[0].dt_txt[9]) != 1)
                baseDt = -2;
        }
        else if(parseInt(weatherData.list[i].dt_txt[8] + weatherData.list[i].dt_txt[9]) == (baseDt+3)){
            arrDate3.push(weatherData.list[i]);
            if(parseInt(weatherData.list[i+1].dt_txt[8] + weatherData.list[i+1].dt_txt[9]) == 1 && parseInt(arrDate3[0].dt_txt[8] + arrDate3[0].dt_txt[9]) != 1)
                baseDt = -3;
        }
        else if(parseInt(weatherData.list[i].dt_txt[8] + weatherData.list[i].dt_txt[9]) == (baseDt+4)){
            arrDate4.push(weatherData.list[i]);
            if(parseInt(weatherData.list[i+1].dt_txt[8] + weatherData.list[i+1].dt_txt[9]) == 1 && parseInt(arrDate4[0].dt_txt[8] + arrDate4[0].dt_txt[9]) != 1)
                baseDt = -4;
        }
        else if(parseInt(weatherData.list[i].dt_txt[8] + weatherData.list[i].dt_txt[9]) == (baseDt+5)){
            arrDate5.push(weatherData.list[i]);
        }
    }
    let comArr = [arrDate0[0], arrDate1[0], arrDate2[0], arrDate3[0], arrDate4[0], arrDate5[0]];
    for(let i=0; i<6; i++){
        let day = new Date(comArr[i].dt*1000).getDay();
        dl_card_arr[i].innerHTML = `<p id="dl-day-1" class="dl-day">${darArrShort[day]}</p>
                <img src="https://openweathermap.org/img/wn/${comArr[i].weather[0].icon}@2x.png" id="dl-icon-1" class="dl-icon">
                <p id="dl-temp-1" class="dl-temp">${Math.round(comArr[i].main.temp)}°C</p>
                <p id="dl-description-1" class="dl-description">${comArr[i].weather[0].main}</p>`
    }
    cardClickFunction(arrDate0,arrDate1,arrDate2,arrDate3,arrDate4,arrDate5);
}

function cardClickFunction(arrDate0,arrDate1,arrDate2,arrDate3,arrDate4,arrDate5){

    let storeDataArr = arrDate0;

    //click event for daily card 0 =>
    document.querySelector('#dl-card-0').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            dl_card_arr[i].style.background = "none";
        }
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-0').style.background = "rgba(255,255,255,0.2)";
        document.querySelector('#dl-card-0').style.background = "rgba(255,255,255,0.2)";
        storeDataArr = arrDate0;
        updateBgImg(arrDate0[0]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${arrDate0[0].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = arrDate0[0].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(arrDate0[0].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(arrDate0[0].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(arrDate0[0].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(arrDate0[0].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(arrDate0[0].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(arrDate0[0].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${arrDate0[0].main.pressure} hPa`;
        let date_data = new Date(arrDate0[0].dt*1000);
        let day = date_data.getDay();
        let month = date_data.getMonth();
        let date = date_data.getDate();
        let year = date_data.getFullYear();
        document.querySelector('.day').innerText = dayArr[day];
        document.querySelector('.date').innerHTML = `<i class="bi bi-calendar3"></i> &nbsp;${monthArr[month]} ${date}, ${year}</p>`;
        let time = parseInt(arrDate0[0].dt_txt[11] + arrDate0[0].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;
    
        for(let i=0; i<6; i++){
            if(arrDate0[i]){
                let today_date = arrDate0[i].dt_txt[8] + arrDate0[i].dt_txt[9];
                let hourly_time = arrDate0[i].dt_txt[11] + arrDate0[i].dt_txt[12];
                let am_pm;
                if(parseInt(hourly_time) < 12)
                    am_pm = 'AM';
                else
                    am_pm = 'PM';
                hr_card_arr[i].style.visibility = "visible";
                hr_card_arr[i].innerHTML = `
                     <p id="hr-time-1" class="hr-time">${timeArr[parseInt(hourly_time)]} ${am_pm}</p>
                     <img src="https://openweathermap.org/img/wn/${arrDate0[i].weather[0].icon}@2x.png" id="hr-icon-1" class="hr-icon">
                     <p id="hr-temp-1" class="hr-temp">${Math.round(arrDate0[i].main.temp)}°C</p>
                     <p id="hr-description-1" class="hr-description">${arrDate0[i].weather[0].main}</p>`
            }
            else{
                 hr_card_arr[i].style.visibility = "hidden";
            }   
         }
    });
    // click event for daily card 1 =>
    document.querySelector('#dl-card-1').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            dl_card_arr[i].style.background = "none";
        }
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-0').style.background = "rgba(255,255,255,0.2)";
        document.querySelector('#dl-card-1').style.background = "rgba(255,255,255,0.2)";
        storeDataArr = arrDate1;
        updateBgImg(arrDate1[0]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${arrDate1[0].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = arrDate1[0].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(arrDate1[0].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(arrDate1[0].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(arrDate1[0].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(arrDate1[0].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(arrDate1[0].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(arrDate1[0].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${arrDate1[0].main.pressure} hPa`;
        let date_data = new Date(arrDate1[0].dt*1000);
        let day = date_data.getDay();
        let month = date_data.getMonth();
        let date = date_data.getDate();
        let year = date_data.getFullYear();
        document.querySelector('.day').innerText = dayArr[day];
        document.querySelector('.date').innerHTML = `<i class="bi bi-calendar3"></i> &nbsp;${monthArr[month]} ${date}, ${year}</p>`;
        let time = parseInt(arrDate1[0].dt_txt[11] + arrDate1[0].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;

        for(let i=0; i<6; i++){
            if(arrDate1[i]){
                let today_date = arrDate1[i].dt_txt[8] + arrDate1[i].dt_txt[9];
                let hourly_time = arrDate1[i].dt_txt[11] + arrDate1[i].dt_txt[12];
                let am_pm;
                if(parseInt(hourly_time) < 12)
                    am_pm = 'AM';
                else
                    am_pm = 'PM';
                hr_card_arr[i].style.visibility = "visible";
                hr_card_arr[i].innerHTML = `
                     <p id="hr-time-1" class="hr-time">${timeArr[parseInt(hourly_time)]} ${am_pm}</p>
                     <img src="https://openweathermap.org/img/wn/${arrDate1[i].weather[0].icon}@2x.png" id="hr-icon-1" class="hr-icon">
                     <p id="hr-temp-1" class="hr-temp">${Math.round(arrDate1[i].main.temp)}°C</p>
                     <p id="hr-description-1" class="hr-description">${arrDate1[i].weather[0].main}</p>`
            }
            else{
                 hr_card_arr[i].style.visibility = "hidden";
            }   
         }
    });

    // click event for daily card 2 =>
    document.querySelector('#dl-card-2').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            dl_card_arr[i].style.background = "none";
        }
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-0').style.background = "rgba(255,255,255,0.2)";
        document.querySelector('#dl-card-2').style.background = "rgba(255,255,255,0.2)";
        storeDataArr = arrDate2;
        updateBgImg(arrDate2[0]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${arrDate2[0].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = arrDate2[0].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(arrDate2[0].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(arrDate2[0].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(arrDate2[0].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(arrDate2[0].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(arrDate2[0].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(arrDate2[0].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${arrDate2[0].main.pressure} hPa`;
        let date_data = new Date(arrDate2[0].dt*1000);
        let day = date_data.getDay();
        let month = date_data.getMonth();
        let date = date_data.getDate();
        let year = date_data.getFullYear();
        document.querySelector('.day').innerText = dayArr[day];
        document.querySelector('.date').innerHTML = `<i class="bi bi-calendar3"></i> &nbsp;${monthArr[month]} ${date}, ${year}</p>`;
        let time = parseInt(arrDate2[0].dt_txt[11] + arrDate2[0].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;
    
        for(let i=0; i<6; i++){
            if(arrDate2[i]){
                let today_date = arrDate2[i].dt_txt[8] + arrDate2[i].dt_txt[9];
                let hourly_time = arrDate2[i].dt_txt[11] + arrDate2[i].dt_txt[12];
                let am_pm;
                if(parseInt(hourly_time) < 12)
                    am_pm = 'AM';
                else
                    am_pm = 'PM';
                hr_card_arr[i].style.visibility = "visible";
                hr_card_arr[i].innerHTML = `
                     <p id="hr-time-1" class="hr-time">${timeArr[parseInt(hourly_time)]} ${am_pm}</p>
                     <img src="https://openweathermap.org/img/wn/${arrDate2[i].weather[0].icon}@2x.png" id="hr-icon-1" class="hr-icon">
                     <p id="hr-temp-1" class="hr-temp">${Math.round(arrDate2[i].main.temp)}°C</p>
                     <p id="hr-description-1" class="hr-description">${arrDate2[i].weather[0].main}</p>`
            }
            else{
                 hr_card_arr[i].style.visibility = "hidden";
            }   
        }
    });
    // click event for daily card 3 =>
    document.querySelector('#dl-card-3').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            dl_card_arr[i].style.background = "none";
        }
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-0').style.background = "rgba(255,255,255,0.2)";
        document.querySelector('#dl-card-3').style.background = "rgba(255,255,255,0.2)";
        storeDataArr = arrDate3;
        updateBgImg(arrDate3[0]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${arrDate3[0].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = arrDate3[0].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(arrDate3[0].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(arrDate3[0].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(arrDate3[0].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(arrDate3[0].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(arrDate3[0].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(arrDate3[0].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${arrDate3[0].main.pressure} hPa`;
        let date_data = new Date(arrDate3[0].dt*1000);
        let day = date_data.getDay();
        let month = date_data.getMonth();
        let date = date_data.getDate();
        let year = date_data.getFullYear();
        document.querySelector('.day').innerText = dayArr[day];
        document.querySelector('.date').innerHTML = `<i class="bi bi-calendar3"></i> &nbsp;${monthArr[month]} ${date}, ${year}</p>`;
        let time = parseInt(arrDate3[0].dt_txt[11] + arrDate3[0].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;
        
        for(let i=0; i<6; i++){
            if(arrDate3[i]){
                let today_date = arrDate3[i].dt_txt[8] + arrDate3[i].dt_txt[9];
                let hourly_time = arrDate3[i].dt_txt[11] + arrDate3[i].dt_txt[12];
                let am_pm;
                if(parseInt(hourly_time) < 12)
                    am_pm = 'AM';
                else
                    am_pm = 'PM';
                hr_card_arr[i].style.visibility = "visible";
                hr_card_arr[i].innerHTML = `
                     <p id="hr-time-1" class="hr-time">${timeArr[parseInt(hourly_time)]} ${am_pm}</p>
                     <img src="https://openweathermap.org/img/wn/${arrDate3[i].weather[0].icon}@2x.png" id="hr-icon-1" class="hr-icon">
                     <p id="hr-temp-1" class="hr-temp">${Math.round(arrDate3[i].main.temp)}°C</p>
                     <p id="hr-description-1" class="hr-description">${arrDate3[i].weather[0].main}</p>`
            }
            else{
                 hr_card_arr[i].style.visibility = "hidden";
            }   
         }
    });
    // click event for daily card 4
    document.querySelector('#dl-card-4').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            dl_card_arr[i].style.background = "none";
        }
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-0').style.background = "rgba(255,255,255,0.2)";
        document.querySelector('#dl-card-4').style.background = "rgba(255,255,255,0.2)";
        storeDataArr = arrDate4;
        updateBgImg(arrDate4[0]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${arrDate4[0].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = arrDate4[0].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(arrDate4[0].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(arrDate4[0].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(arrDate4[0].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(arrDate4[0].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(arrDate4[0].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML =`Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(arrDate4[0].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${arrDate4[0].main.pressure} hPa`;
        let date_data = new Date(arrDate4[0].dt*1000);
        let day = date_data.getDay();
        let month = date_data.getMonth();
        let date = date_data.getDate();
        let year = date_data.getFullYear();
        document.querySelector('.day').innerText = dayArr[day];
        document.querySelector('.date').innerHTML = `<i class="bi bi-calendar3"></i> &nbsp;${monthArr[month]} ${date}, ${year}</p>`;
        let time = parseInt(arrDate4[0].dt_txt[11] + arrDate4[0].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;
    
        for(let i=0; i<6; i++){
            if(arrDate4[i]){
                let today_date = arrDate4[i].dt_txt[8] + arrDate4[i].dt_txt[9];
                let hourly_time = arrDate4[i].dt_txt[11] + arrDate4[i].dt_txt[12];
                let am_pm;
                if(parseInt(hourly_time) < 12)
                    am_pm = 'AM';
                else
                    am_pm = 'PM';
                hr_card_arr[i].style.visibility = "visible";
                hr_card_arr[i].innerHTML = `
                    <p id="hr-time-1" class="hr-time">${timeArr[parseInt(hourly_time)]} ${am_pm}</p>
                    <img src="https://openweathermap.org/img/wn/${arrDate4[i].weather[0].icon}@2x.png" id="hr-icon-1" class="hr-icon">
                    <p id="hr-temp-1" class="hr-temp">${Math.round(arrDate4[i].main.temp)}°C</p>
                    <p id="hr-description-1" class="hr-description">${arrDate4[i].weather[0].main}</p>`
            }
            else{
                 hr_card_arr[i].style.visibility = "hidden";
            }   
         }
    });
    // click event for daily card 5
    document.querySelector('#dl-card-5').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            dl_card_arr[i].style.background = "none";
        }
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-0').style.background = "rgba(255,255,255,0.2)";
        document.querySelector('#dl-card-5').style.background = "rgba(255,255,255,0.2)";
        storeDataArr = arrDate5;
        updateBgImg(arrDate5[0]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${arrDate5[0].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = arrDate5[0].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(arrDate5[0].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(arrDate5[0].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(arrDate5[0].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(arrDate5[0].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(arrDate5[0].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(arrDate5[0].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${arrDate5[0].main.pressure} hPa`;
        let date_data = new Date(arrDate5[0].dt*1000);
        let day = date_data.getDay();
        let month = date_data.getMonth();
        let date = date_data.getDate();
        let year = date_data.getFullYear();
        document.querySelector('.day').innerText = dayArr[day];
        document.querySelector('.date').innerHTML = `<i class="bi bi-calendar3"></i> &nbsp;${monthArr[month]} ${date}, ${year}</p>`;
        let time = parseInt(arrDate5[0].dt_txt[11] + arrDate5[0].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;
        for(let i=0; i<6; i++){
            if(arrDate5[i]){
                let today_date = arrDate5[i].dt_txt[8] + arrDate5[i].dt_txt[9];
                let hourly_time = arrDate5[i].dt_txt[11] + arrDate5[i].dt_txt[12];
                let am_pm;
                if(parseInt(hourly_time) < 12)
                    am_pm = 'AM';
                else
                    am_pm = 'PM';
                hr_card_arr[i].style.visibility = "visible";
                hr_card_arr[i].innerHTML = `
                     <p id="hr-time-1" class="hr-time">${timeArr[parseInt(hourly_time)]} ${am_pm}</p>
                     <img src="https://openweathermap.org/img/wn/${arrDate5[i].weather[0].icon}@2x.png" id="hr-icon-1" class="hr-icon">
                     <p id="hr-temp-1" class="hr-temp">${Math.round(arrDate5[i].main.temp)}°C</p>
                     <p id="hr-description-1" class="hr-description">${arrDate5[i].weather[0].main}</p>`
            }
            else{
                 hr_card_arr[i].style.visibility = "hidden";
            }   
         }
    });

    // click event for hourly cards begins from here .....

    // click event for hourly card 0 =>
    document.querySelector('#hr-card-0').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-0').style.background = "rgba(255,255,255,0.2)";
        updateBgImg(storeDataArr[0]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${storeDataArr[0].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = storeDataArr[0].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(storeDataArr[0].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(storeDataArr[0].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(storeDataArr[0].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[0].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[0].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[0].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${storeDataArr[0].main.pressure} hPa`;
        let time = parseInt(storeDataArr[0].dt_txt[11] + storeDataArr[0].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;
    });
    // click event for hourly card 1 =>
    document.querySelector('#hr-card-1').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-1').style.background = "rgba(255,255,255,0.2)";
        updateBgImg(storeDataArr[1]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${storeDataArr[1].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = storeDataArr[1].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(storeDataArr[1].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(storeDataArr[1].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(storeDataArr[1].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[1].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[1].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[1].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${storeDataArr[1].main.pressure} hPa`;
        let time = parseInt(storeDataArr[1].dt_txt[11] + storeDataArr[1].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;
    });
    // click event for hourly card 2 =>
    document.querySelector('#hr-card-2').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-2').style.background = "rgba(255,255,255,0.2)";
        updateBgImg(storeDataArr[2]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${storeDataArr[2].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = storeDataArr[2].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(storeDataArr[2].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(storeDataArr[2].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(storeDataArr[2].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[2].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[2].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[2].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${storeDataArr[2].main.pressure} hPa`;
        let time = parseInt(storeDataArr[2].dt_txt[11] + storeDataArr[2].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;
    });
    // click event for hourly card 3 =>
    document.querySelector('#hr-card-3').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-3').style.background = "rgba(255,255,255,0.2)";
        updateBgImg(storeDataArr[3]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${storeDataArr[3].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = storeDataArr[3].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(storeDataArr[3].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(storeDataArr[3].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(storeDataArr[3].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[3].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[3].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[3].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${storeDataArr[3].main.pressure} hPa`;
        let time = parseInt(storeDataArr[3].dt_txt[11] + storeDataArr[3].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;
    });
    // click event for hourly card 4 =>
    document.querySelector('#hr-card-4').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-4').style.background = "rgba(255,255,255,0.2)";
        updateBgImg(storeDataArr[4]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${storeDataArr[4].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = storeDataArr[4].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(storeDataArr[4].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(storeDataArr[4].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(storeDataArr[4].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[4].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[4].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[4].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${storeDataArr[4].main.pressure} hPa`;
        let time = parseInt(storeDataArr[4].dt_txt[11] + storeDataArr[4].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;
    });
    document.querySelector('#hr-card-5').addEventListener('click',()=>{
        for(let i=0; i<6; i++){
            hr_card_arr[i].style.background = "none";
        }
        document.querySelector('#hr-card-5').style.background = "rgba(255,255,255,0.2)";
        updateBgImg(storeDataArr[5]);
        document.querySelector('.weather-icon').src = `https://openweathermap.org/img/wn/${storeDataArr[5].weather[0].icon}@2x.png`;
        document.querySelector('.weather-description').innerText = storeDataArr[5].weather[0].description;
        document.querySelector('.temperature').innerText = Math.round(storeDataArr[5].main.temp) + "°C";
        document.querySelector('.temp-max-min').innerHTML = `Max &nbsp;<i class="bi bi-thermometer-high"></i>&nbsp; ${Math.round(storeDataArr[5].main.temp_max)}°C &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Min &nbsp;<i class="bi bi-thermometer-low"></i>&nbsp; ${Math.round(storeDataArr[5].main.temp_min)}°C`;
        document.querySelector('.feels-like').innerHTML = `Feels Like &nbsp;<i class="bi bi-thermometer-half"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[5].main.feels_like)}°C`;
        document.querySelector('.wind-speed').innerHTML = `Wind Speed &nbsp;<i class="bi bi-wind"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[5].wind.speed)} m/s`;
        document.querySelector('.humidity').innerHTML = `Humidity &nbsp;<i class="bi bi-droplet"></i>&nbsp;&nbsp; ${Math.round(storeDataArr[5].main.humidity)}%`;
        document.querySelector('.pressure').innerHTML = `Pressure &nbsp;<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp; ${storeDataArr[5].main.pressure} hPa`;
        let time = parseInt(storeDataArr[5].dt_txt[11] + storeDataArr[5].dt_txt[12]);
        if(time < 12){
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} AM`;
        }
        else
            document.querySelector('.time').innerHTML = `<i class="bi bi-clock"></i> &nbsp;${timeArr[time]} PM`;
    });
}

function updateBgImg(weatherData){
    let main = weatherData.weather[0].main;
    let description = weatherData.weather[0].description;
    let body = document.querySelector('body');
    
    if(main == 'Thunderstorm'){
        body.style.backgroundImage = "url(condition_images/thunderstorm.jpg)";
    }
    else if(main == 'Drizzle'){
        body.style.backgroundImage = "url(condition_images/scattered-cloud.jpg)";
    }
    else if(main == 'Rain'){
        if(description == 'heavy intensity rain' || description == 'very heavy rain' || description == 'extreme rain'){
            body.style.backgroundImage = "url(condition_images/raining-cloud.jpg)";
        }
        else{
            body.style.backgroundImage = "url(condition_images/scattered-cloud.jpg)";
        }
    }
    else if(main == 'Snow'){
        body.style.backgroundImage = "url(condition_images/snow.jpg)";
    }
    else if(main == 'Clear'){
        body.style.backgroundImage = "url(condition_images/clear-sky.jpg)";
    }
    else if(main == 'Clouds'){
        if(description == 'few clouds' || description == 'scattered clouds'){
            body.style.backgroundImage = "url(condition_images/few-cloud.jpeg)";
        }
        else
            body.style.backgroundImage = "url(condition_images/scattered-cloud.jpg)";
    }
    else{
        body.style.backgroundImage = "url(condition_images/mist.jpeg)";
        document.querySelector('.forecast_box').style.backdropFilter = `blur(${6}px)`;
    }
}
