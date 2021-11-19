//点位相关
import "../api/leaflet_markercluster/leaflet.markercluster-src.js";
import "../api/leaflet_markercluster/MarkerCluster.css"
import "../api/leaflet_markercluster/MarkerCluster.Default.css"

//点位图标参数
const icon_info_list = {
    chest_icon: L.Icon.extend({
        options: {
            shadowUrl: "https://yuanshen.site/imgs/loc_stonenot.svg",
            iconSize: [22, 22], // size of the icon
            shadowSize: [24, 24], // size of the shadow
            iconAnchor: [11, 11], // point of the icon which will correspond to marker's location
            shadowAnchor: [12, 11], // the same for the shadow
            popupAnchor: [0, -22] // point from which the popup should open relative to the iconAnch
        }
    })
}
function layergroup_register(layerdata, map) {
    var layer_list = {
        select_Layer: L.markerClusterGroup(map),
    }
    var markers = {};
    //生成点位
    L.geoJSON(layerdata, {
        pointToLayer: function (feature, latlng) {
            var key = feature.id;
            var marker = L.marker([latlng.lng, latlng.lat], {
                icon: new icon_info_list[Object.keys(icon_info_list)[0]]({
                    className: `mark-${4}_${feature.id}`,
                    iconUrl: 'https://yuanshen.site/imgs/icon_26.svg'
                }),
                alt: `${latlng.lng},${latlng.lat}`
            });
            markers[key] = marker;
            return marker.addTo(layer_list.select_Layer);
        },
    });
    return layer_list
}
export { layergroup_register }