//地图信息维护相关接口
import axios from 'axios'
import { Cookies } from "quasar";
import md5 from "js-md5";
//默认请求封装
async function defalut_request(method, url, data = {}) {
    let ts = Date.now() - Cookies.get("time_difference");
    let sign = md5(ts + "site.yuanshen");
    try {
        return await axios({
            method: method,
            url: url,
            headers: {
                'ts': ts,
                'sign': sign,
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('user_token')
            },
            data: JSON.stringify({ ...data })
        });
    } catch (error) {
        alert(error);
    }

}
//地图区域设置
function map_area_handle(method, data, id = '') {
    return defalut_request(method, `http://api.yuanshen.site:8089/api/basic/area/${id}`, data);
}
//地图区域启用/禁用
function map_area_switch(id) {
    return defalut_request('post', `http://api.yuanshen.site:8089/api/basic/area/switch/${id}/`);
}
//地图选项类型设置
function map_type_handle(method, data, id = '') {
    return defalut_request(method, `http://api.yuanshen.site:8089/api/basic/type/${id}`, data);
}
//地图选项类型启用/禁用
function map_type_switch(id) {
    return defalut_request('post', `http://api.yuanshen.site:8089/api/basic/type/switch/${id}/`);
}
//地图点位类型设置
function map_item_handle(method, data, id = '') {
    return defalut_request(method, `http://api.yuanshen.site:8089/api/basic/item/${id}`, data);
}
//地图点位启用/禁用
function map_item_switch(id) {
    return defalut_request('post ', `http://api.yuanshen.site:8089/api/basic/item/switch/${id}`, data);
}
//地图点位设置
function map_markers_handle(id = "", keyword = "") {
    let url = `http://api.yuanshen.site:8089/api/basic/marker/${id}`
    if (keyword != "") {
        url += `?keyword=${keyword}`
    }
    return defalut_request('get', `http://api.yuanshen.site:8089/api/basic/marker/${id}`)
}
export {
    map_area_handle,
    map_area_switch,
    map_type_handle,
    map_type_switch,
    map_item_handle,
    map_item_switch,
    map_markers_handle
}