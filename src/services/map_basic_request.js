//地图信息维护相关接口
import axios from 'axios'
import { Cookies } from "quasar";
import md5 from "js-md5";
//默认请求封装
async function defalut_request(method, url, data = {}) {
    let ts = Date.now() - Cookies.get("time_difference");
    let sign = md5(ts + "site.yuanshen");
    try {
        return axios({
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
        alert(`发生错误，错误原因:${error.message}`);
    }
}
//地图区域设置
function map_area_handle(method, data, id = '') {
    return defalut_request(method, `http://8.129.180.37:8089/api/basic/area/${id}`, data);
}
//地图区域启用/禁用
function map_area_switch(id) {
    return defalut_request('post', `http://8.129.180.37:8089/api/basic/area/switch/${id}/`);
}
//地图选项类型设置
function map_type_handle(method, data, id = '') {
    return defalut_request(method, `http://8.129.180.37:8089/api/basic/type/${id}`, data);
}
//地图选项类型启用/禁用
function map_type_switch(id) {
    return defalut_request('post', `http://8.129.180.37:8089/api/basic/type/switch/${id}/`);
}
//地图点位类型设置
function map_item_handle(method, data, id = '') {
    return defalut_request(method, `http://8.129.180.37:8089/api/basic/item/${id}`, data);
}
export {
    map_area_handle,
    map_area_switch,
    map_type_handle,
    map_type_switch,
    map_item_handle
}