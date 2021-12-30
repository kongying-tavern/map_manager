<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: "App",
};
</script>

<style>
@import "./assets/css/main.css";
@import "./assets/css/transition.css";
@import "./assets/css/cimo.css";
#popup_window {
  width: 250px;
}
.popup {
  width: 250px;
  font-size: 16px;
}
.leaflet-container a.leaflet-popup-close-button {
  position: absolute;
  top: 8px;
  right: 16px;
  padding: 4px 4px 0 0;
  border: none;
  text-align: center;
  width: 18px;
  height: 14px;
  font: 30px/14px Tahoma, Verdana, sans-serif;
  color: #c3c3c3;
  text-decoration: none;
  font-weight: bold;
  background: transparent;
}
</style>
