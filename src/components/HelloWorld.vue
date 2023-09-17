<template>
  <div>
    <div class="header">
      <span style="background-color: aliceblue;font-size: 20px">Move the mouse to the value of the object, and click to copy the path of value when the color changes to green.</span>
    </div>

    <div>
      <a href="https://your-url" class="github-corner" aria-label="View source on GitHub">
        <svg width="80" height="80" viewBox="0 0 250 250"
             style="fill:#151513; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true">
          <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
          <path
              d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
              fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
          <path
              d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
              fill="currentColor" class="octo-body"></path>
        </svg>
      </a>

    </div>

    <div>
    <textarea class="json_input" v-model="jsonStr">

    </textarea>
    </div>
    <div>
      <span class="path_show">{{jp}}</span>
    </div>
    <div>
      <div v-html="tableHtmlStr">

      </div>
    </div>


  </div>
</template>

<script setup>
import {onMounted, onUpdated, ref, watch} from 'vue'
import {genHtml} from "@/util/nJsonTable";

let json_path = ref('')
let jp = '123'
// let  a = '231'

const jsonStr = ref('{\n' +
    '   "results" : [\n' +
    '      {\n' +
    '         "address_components" : [\n' +
    '            {\n' +
    '               "long_name" : "1600",\n' +
    '               "short_name" : "1600",\n' +
    '               "types" : [ "street_number" ]\n' +
    '            },\n' +
    '            {\n' +
    '               "long_name" : "Amphitheatre Pkwy",\n' +
    '               "short_name" : "Amphitheatre Pkwy",\n' +
    '               "types" : [ "route" ]\n' +
    '            },\n' +
    '            {\n' +
    '               "long_name" : "Mountain View",\n' +
    '               "short_name" : "Mountain View",\n' +
    '               "types" : [ "locality", "political" ]\n' +
    '            },\n' +
    '            {\n' +
    '               "long_name" : "Santa Clara",\n' +
    '               "short_name" : "Santa Clara",\n' +
    '               "types" : [ "administrative_area_level_2", "political" ]\n' +
    '            },\n' +
    '            {\n' +
    '               "long_name" : "California",\n' +
    '               "short_name" : "CA",\n' +
    '               "types" : [ "administrative_area_level_1", "political" ]\n' +
    '            },\n' +
    '            {\n' +
    '               "long_name" : "United States",\n' +
    '               "short_name" : "US",\n' +
    '               "types" : [ "country", "political" ]\n' +
    '            },\n' +
    '            {\n' +
    '               "long_name" : "94043",\n' +
    '               "short_name" : "94043",\n' +
    '               "types" : [ "postal_code" ]\n' +
    '            }\n' +
    '         ],\n' +
    '         "formatted_address" : "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",\n' +
    '         "geometry" : {\n' +
    '            "location" : {\n' +
    '               "lat" : 37.42291810,\n' +
    '               "lng" : -122.08542120\n' +
    '            },\n' +
    '            "location_type" : "ROOFTOP",\n' +
    '            "viewport" : {\n' +
    '               "northeast" : {\n' +
    '                  "lat" : 37.42426708029149,\n' +
    '                  "lng" : -122.0840722197085\n' +
    '               },\n' +
    '               "southwest" : {\n' +
    '                  "lat" : 37.42156911970850,\n' +
    '                  "lng" : -122.0867701802915\n' +
    '               }\n' +
    '            }\n' +
    '         },\n' +
    '         "types" : [ "street_address" ]\n' +
    '      }\n' +
    '   ],\n' +
    '   "status" : "OK"\n' +
    '}')
const tableHtmlStr = ref('')

// 可以直接侦听一个 ref
watch(jsonStr, async (newQuestion) => {
      if (newQuestion === '') {
        return
      }
      try {
        let json = JSON.parse(newQuestion);
        console.log(json)
        tableHtmlStr.value = genHtml(
            json
        )
      } catch (e) {
        tableHtmlStr.value = newQuestion
      }
    },
)

onMounted(() => {


  if (jsonStr.value === '') {
    return
  }
  try {
    let json = JSON.parse(jsonStr.value);
    console.log(json)
    tableHtmlStr.value = genHtml(
        json
    )
  } catch (e) {
    tableHtmlStr.value = jsonStr.value
  }


})
onUpdated(() => {

  var comments = document.getElementsByTagName('td');
  var numComments = comments.length;


  for (var i = 0; i < numComments; i++) {
    comments[i].addEventListener('click', (e) => {
      console.log(1332313)
      window.event ? window.event.cancelBubble = true : e.stopPropagation();
      const path = e.target.getAttribute('p');
      // console.log(path)
      navigator.clipboard.writeText(path);

      json_path.value = path
      console.log(json_path.value)
      jp = path
      const elementsByClassName = document.getElementsByClassName('path_show')[0];
      elementsByClassName.textContent = path
    }, false);


    comments[i].onmouseover = function (e) {
      window.event ? window.event.cancelBubble = true : e.stopPropagation();

      var element = document.elementFromPoint(e.pageX, e.pageY);

      const tagName = element.tagName;
      // console.log(tagName)
      if (tagName === 'TD') {
        this.style.backgroundColor = "#8bc34a45"
      }

    }
    comments[i].onmouseout = function (e) {
      window.event ? window.event.cancelBubble = true : e.stopPropagation();
      this.style.backgroundColor = "";
    }

  }
})
</script>
<style type="text/css">
@import url(../table.css);
</style>

