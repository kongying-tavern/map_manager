//地图初始化
import * as L from 'leaflet'
import "leaflet/dist/leaflet.css";
const addmode_map_state = {

}
function initmap(map, area_idx = 'mainworld') {
    map = null;
    //初始化地图中心和地图尺寸
    var mapCenter = [3568, 6286],
        mapSize = [12288, 15360]
    //设置地图要使用的坐标参考系（CRS），本地图使用simple类型CRS，将经度和纬度直接映射到x和y。
    var mapCRS = L.Util.extend({}, L.CRS.Simple, {
        //用给定的系数表示变换对象。
        transformation: new L.Transformation(1, 0, 1, 0),
        projection: {
            //将地理坐标投影为CRS所接受的单位坐标
            project: function (latlng) {
                return new L.Point(latlng.lat + mapCenter[0], latlng.lng + mapCenter[1])
            },
            //给定CRS坐标，反向投影为地理坐标
            unproject: function (point) {
                return new L.LatLng(point.x - mapCenter[0], point.y - mapCenter[1])
            },
        },
        //以像素坐标表示矩形区域
        bounds: L.bounds(L.point(0, 0), L.point(mapSize[0], mapSize[1])),
    })
    let mapdata = L.map('map', {
        crs: mapCRS,
        center: [-528, 1742],
        zoomDelta: 0,
        zoomSnap: 0.5,
        maxZoom: 2,
        minZoom: -4,
        zoom: -4,
        tap: false,
        // maxBounds: L.latLngBounds(
        //     L.latLng(-mapCenter[0], -mapCenter[1]),
        //     L.latLng(mapSize[0] - mapCenter[0], mapSize[1] - mapCenter[1])
        // ),
        attributionControl: false,
        zoomControl: false,
    });
    // let mapdata = L.map('map', {
    //     crs: mapCRS,
    //     center: [3200, -3000],
    //     zoomDelta: 0,
    //     zoomSnap: 0.5,
    //     maxZoom: 2,
    //     minZoom: -4,
    //     zoom: -3,
    //     tap: false,
    //     // maxBounds: L.latLngBounds(
    //     //     L.latLng(-mapCenter[0], -mapCenter[1]),
    //     //     L.latLng(mapSize[0] - mapCenter[0], mapSize[1] - mapCenter[1])
    //     // ),
    //     attributionControl: false,
    //     zoomControl: false,
    // });
    map = mapdata;
    //注册地图瓦片
    L.TileLayer.T = L.TileLayer.extend({
        getTileUrl: function (coords) {
            var x = coords.x,
                y = coords.y,
                z = coords.z + 13
            switch (area_idx) {
                case 'mainworld':
                    return `https://assets.yuanshen.site/tiles_dq3/${z}/${x}_${y}.jpg`
                case 'QD':
                    return `https://assets.yuanshen.site/tiles_qd/${z}/${x}_${y}.jpg`
                case 'QD1':
                    return `https://assets.yuanshen.site/tiles_qd1/${z}/${x}_${y}.jpg`
                case 'YXG':
                    return `https://assets.yuanshen.site/tiles_yxg/${z}/${x}_${y}.jpg`
                default:
                    return L.Util.emptyImageUrl
            }
        },
        //如果此项为true，在平移后不可见的切片被放入一个队列中，在新的切片开始可见时他们会被取回（而不是动态地创建一个新的）。这理论上可以降低内存使用率并可以去除在需要新的切片时预留内存。
        reuseTiles: true,
    });
    var T = new L.TileLayer.T('', {
        maxZoom: 10,
        minZoom: -6,
        maxNativeZoom: 0,
        minNativeZoom: -3,
        bounds: L.latLngBounds(
            L.latLng(-mapCenter[0], -mapCenter[1]),
            L.latLng(mapSize[0] - mapCenter[0], mapSize[1] - mapCenter[1])
        ),
    });
    map.addLayer(T);
    return map;
}
function switch_map(map, area_idx) {
    var mapCenter = [3568, 6286],
        mapSize = [12288, 15360]
    let mapset = "";
    L.TileLayer.T = L.TileLayer.extend({
        getTileUrl: function (coords) {
            var x = coords.x,
                y = coords.y,
                z = coords.z + 13
            switch (area_idx) {
                case 'mainworld':
                    return `https://assets.yuanshen.site/tiles_dq3/${z}/${x}_${y}.jpg`
                case 'QD':
                    return `https://assets.yuanshen.site/tiles_qd/${z}/${x}_${y}.jpg`
                case 'QD1':
                    return `https://assets.yuanshen.site/tiles_qd1/${z}/${x}_${y}.jpg`
                case 'YXG':
                    return `https://assets.yuanshen.site/tiles_yxg/${z}/${x}_${y}.jpg`
                default:
                    return L.Util.emptyImageUrl
            }
        },
        //如果此项为true，在平移后不可见的切片被放入一个队列中，在新的切片开始可见时他们会被取回（而不是动态地创建一个新的）。这理论上可以降低内存使用率并可以去除在需要新的切片时预留内存。
        reuseTiles: true,
    });
    var T = new L.TileLayer.T('', {
        maxZoom: 10,
        minZoom: -6,
        maxNativeZoom: 0,
        minNativeZoom: -3,
        bounds: L.latLngBounds(
            L.latLng(-mapCenter[0], -mapCenter[1]),
            L.latLng(mapSize[0] - mapCenter[0], mapSize[1] - mapCenter[1])
        ),
    });
    let oldlayer = null;
    map.eachLayer(layer => {
        oldlayer = layer
    })
    map.removeLayer(oldlayer)
    map.addLayer(T);
    return map
}
export { initmap, switch_map }