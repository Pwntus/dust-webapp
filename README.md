> Duster overalt.
>
> \- Fredrik H. Rasch

![Example Screenshot](public/demo.png?raw=true "Example")

## Watch it live!
[http://startiot.cs.uit.no/dust/](http://startiot.cs.uit.no/dust/)

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run serve

# build for production with minification
npm run build
```

# NEW: Configure Your Own Modules!

Simply append a JSON-string at the end of the URL, like this: [http://startiot.cs.uit.no/dust/[{"name":"bus-card","title":"UiT Southbound","from":"19021323:2"},{"name":"airport-card","title":"Helsinki-Vantaan lentoasema","center":"60.32,24.95","zoom":"9"}]](http://startiot.cs.uit.no/dust/%5B%7B%22name%22%3A%22bus-card%22%2C%22title%22%3A%22UiT+Southbound%22%2C%22from%22%3A%2219021323%3A2%22%7D%2C%7B%22name%22%3A%22airport-card%22%2C%22title%22%3A%22Helsinki-Vantaan+lentoasema%22%2C%22center%22%3A%2260.32%2C24.95%22%2C%22zoom%22%3A%229%22%7D%5D)

The JSON-string must be an array containing object representations of each module to add to the screen. The following module definitions are available:

**Bus Card**
```json
{
  "name": "bus-card",
  "title": "The module title",
  "from": "Travel magic from ID"
}
```

**Airport Card**
```json
{
  "name": "airport-card",
  "title": "The module title",
  "center": "lat,lng coordinates of the map center",
  "zoom": "0-18 value of the starting zoom level of the map"
}
```

**Example**
```json
[
  {
    "name": "bus-card",
    "title": "UiT Southbound",
    "from": "19021323:2"
  },
  {
    "name": "airport-card",
    "title": "Helsinki-Vantaan lentoasema",
    "center": "60.32,24.95",
    "zoom": "9"
  }
]
```
