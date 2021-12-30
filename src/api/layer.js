//点位相关
import * as L from 'leaflet'
import "leaflet/dist/leaflet.css";
import "../api/leaflet_markercluster/leaflet.markercluster-src.js";
import "../api/leaflet_markercluster/MarkerCluster.css"
import "../api/leaflet_markercluster/MarkerCluster.Default.css"
/**
* 生成点位背景
* @param {string} type 点位背景的类型 border_off：默认；border_on：选中态；none：无背景
* @returns {Object}
*/
function icon_bg(type) {
    let options = {
        shadowUrl: 'https://assets.yuanshen.site/icons/loc_02_off.png',
        iconSize: [22, 22], // size of the icon
        shadowSize: [32, 36], // size of the shadow
        iconAnchor: [11, 30], // point of the icon which will correspond to marker's location
        shadowAnchor: [16, 35], // the same for the shadow
        popupAnchor: [0, -35], // point from which the popup should open relative to the iconAnchor
    };
    switch (type) {
        case 'border_off':
            break;
        case 'border_on':
            options.shadowUrl = 'https://assets.yuanshen.site/icons/loc_02_on.png'
            break;
        case 'border_checking':
            options.shadowUrl = 'https://assets.yuanshen.site/icons/loc_02_submit.png'
            break;
        case 'border_unsubmit':
            options.shadowUrl = 'https://assets.yuanshen.site/icons/loc_02_unsubmit.png'
            break;
        case "none":
            options = {
                iconSize: [22, 22], // size of the icon
                iconAnchor: [11, 11], // point of the icon which will correspond to marker's location
                popupAnchor: [0, -22], // point from which the popup should open relative to the iconAnchor
            }
            break;
    }
    let icon_data = L.Icon.extend({ options });
    return icon_data
}
/**
* 将获取的点位组信息转化成leaflet的geojson对象
* @param {Object} data 点位组对象信息
* @returns {Object} geojson对象
*/
function create_geojson(data) {
    let item_list = [
        {
            type: "FeatureCollection",
            features: [],
        },
    ];
    for (let i of data) {
        item_list[0].features.push({
            geometry: {
                type: "Point",
                coordinates: i.position.split(","),
            },
            type: "Feature",
            properties: {
                popTitle: i.title,
                popupContent: i.content,
            },
            icon_src: i.icon,
            imgsrc: i.resource,
            layer_id: i.mlayer,
            id: i.id,
            check_in: i.check_in,
            data: {
                ...i
            }
        });
    }
    return item_list
}
/**
* 生成单个点位
* @param {array} latlng 点位坐标参数
* @param {string} state 调用类型，可选参数为'marker'和'group'，前者为打点新增，后者为渲染点位组中点位
* @param {string} icontype 生成的点位的框框背景的类型，默认为正常边框，可选项见上方背景生成函数api
* @param {array} item_id 点位组对象id
* @param {array} icon 点位图标
* @returns {Object} marker对象
 */
function layer_register(latlng, state, icontype = "border_off", item_id, icon) {
    //首先判断点位是有边框还是无边框类型
    //再判断点位是否是存档中标记的点位
    //有边框点位通过更改背景图片展示是否标记。无边框类则是更改点位图片
    let icondata = icon_bg(icontype);
    let marker_order = [latlng.lat, latlng.lng];
    switch (state) {
        //传到数据库中的点位的渲染使用的是lng-lat（即yx轴），而打点时使用的是xy轴，故打点时生成的点位坐标的xy轴需要倒置
        //所以打点的state传入marker，而渲染拉取的点位用group，否则在地图上展示的位置就是镜像位置
        case 'marker':
            marker_order = [latlng.lat, latlng.lng]
            break;
        case 'group':
            marker_order = [latlng.lng, latlng.lat]
            break;
    }
    var marker = L.marker(marker_order, {
        icon: new icondata({
            className: `mark-${item_id}`,
            iconUrl: icon,
            state: 'off'
        }),
        alt: `${latlng.lat},${latlng.lng}`,
    });
    return marker;
}
/**
* 生成点位组
* @param {array} layergroup_data  要生成点位的点位组对象数组
* @param {Object} map map实例对象
* @param {array} item_id 点位组对象id,用于获取点位的图标等信息
* @returns {Object} markerClusterGroup对象（聚合后的点位组）
 */
function layergroup_register(layergroup_data, map) {
    var layer_list = {
        select_Layer: L.markerClusterGroup(map),
    }
    var markers = {};
    //生成点位
    L.geoJSON(layergroup_data, {
        pointToLayer: function (feature, latlng) {
            var key = feature.id;
            var marker = layer_register(latlng, 'group', feature.check_in ? 'border_checking' : undefined, feature.layer_id, feature.icon_src);
            markers[key] = marker;
            return marker.addTo(layer_list.select_Layer);
        },
    });
    return layer_list
}
export {
    icon_bg,
    create_geojson,
    layer_register,
    layergroup_register,
}