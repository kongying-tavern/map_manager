//地图相关请求函数
import axios from 'axios'
import { Cookies } from "quasar";
import md5 from "js-md5";
//默认请求封装
async function defalut_request(method, url) {
    let ts = Date.now() - Cookies.get("time_difference");
    let sign = md5(ts + "site.yuanshen");
    try {
        return axios({
            method: method,
            url: url,
            headers: { ts: ts, sign: sign }
        });
    } catch (error) {
        alert(`发生错误，错误原因:${error.message}`);
    }

}
const config = { headers: { 'Content-Type': 'application/json', 'Authorization': `${localStorage.getItem('token')}` } }
async function default_axios(url, data) {
    //默认参数
    let defalutdata = {
        OperateType: 1,
        Operator: "",
        PageSize: 10,
        Page: 1,
        KeyWord: '',
    }
    //合并默认参数和传参，两者之中的相同键的值会由后者覆盖前者
    data = Object.assign(defalutdata, data);
    try {
        return axios.post(url, JSON.stringify(data), config);
    } catch (error) {
        alert(`发生错误，错误原因:${error.message}`);
    }
}
//请求点位数据信息
function options_type_select() {
    return defalut_request('get', "http://8.129.180.37:8089/api/option")
}
function layer_data_select(id) {
    return defalut_request('get', `http://8.129.180.37:8089/api/marker/${id}`)
}
function layer_keyword_select(keyword) {
    return defalut_request('get', `http://8.129.180.37:8089/api/option?keyword=${keyword}`)
}
function dep_handel(data) {
    return default_axios('http://192.168.100.94:8083/api/pms/dp', data);
}
export { options_type_select, layer_data_select, layer_keyword_select, dep_handel }