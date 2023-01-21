# RouteCost

Esta API REST sirve para obtener la distancia, el clima de un punto **A** un punto **B ** y ademas calcula el costo que implica desplazarse.

This API REST get the score and data of any route , in otherwise is the route cost computing.

Puedes obtener mas informacion en mi pagina web :####Puedes obtener mas informacion en mi pagina web : [soyfullstackdeveloper.com](https://soyfullstackdeveloper.com/)

![cli-colors-alertsscreenshot](.github/route-cost-working.png)

# Caracteristicas

-   Obtiene el clima de un determinado lugar
-   Calcula la distancia de un punto **A** a un punto **B**
-   Genera elcosto que implica desplazarce entre ambos puntos.

# Instalación y configuración:

Para instalar el proyecto se debe seguir lo siguientes pasos.

    git clone https://github.com/MoralexCode/routecost.git
    npm i
    crear un archivo .env en la raiz del proyecto
    dentro del archivo .env agregar la siguientes variables de entorno
        APIKEY=`Clave  de la api google`
        APPID=`id de la aplicacion de google`
        MAPS_URL=https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&key=
        WEATHER_ZIP_CODE_URL=http://api.openweathermap.org/data/2.5/weather?lang=es&units=metric&APPID=
        WEATHER_CONDITIONS=https://openweathermap.org/weather-conditions
        MONGODB_USER=`Usuario de la base de datos de MongoDB`
        MONGODB_PASSWORD=`Password de la base de datos de MongoDB`
        MONGODB_URL=`URL de la base de datos de MongoDB, si utilizas MongoAtlas u otro servicio de Mongo en la nube`
        HOST=http://localhost

    npm start

# Cómo usar:

Una vez descargado, puedes ejecutar el siguiente endpoint en un cliente rest:

    Clima :
    'localhost:port/api/weather/17.0812951/-96.7707511'
    Distancia:
    'localhost:port/api/distance/16.430746/-95.4399602/17.0812951/-96.7707511'
    Clima, distancia y el costo :
    'localhost:port/api/cost/16.430746/-95.4399602/17.0812951/-96.7707511'

### Respuesta

    {
    "response": {
        "origin": {
            "place": "José María Morelos y Pavón, Aguascalientes, Santa María Jalapa del Marqués, Oax., Mexico",
            "name": "Jalapa",
            "description": "cielo claro",
            "temp": 26.93,
            "icon": "http://openweathermap.org/img/wn/01d@2x.png"
        },
        "destination": {
            "place": "Cuicatlán 105, Col Guelaguetza, Santa María Atzompa, Oax., Mexico",
            "name": "San Jacinto Amilpas",
            "description": "cielo claro",
            "temp": 22,
            "icon": "http://openweathermap.org/img/wn/01d@2x.png"
        },
        "cost": "1706.00",
        "distance": "228 km",
        "time": "4 hours 12 mins"
    }

}

### if the API KEY is invalid, you can see this message :

    MAPS_URL response :  {  destination_addresses: [],   error_message: 'The provided API key is invalid.',  origin_addresses: [],   rows: [],  status: 'REQUEST_DENIED'}

Run Test:

![cli-colors-alertsscreenshot](.github/route-cost-test.png)

## Licencia

MIT
