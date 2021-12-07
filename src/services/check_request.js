//点位审核相关
import axios from 'axios'
import { Cookies } from "quasar";
import md5 from "js-md5";
//默认请求封装
async function defalut_request(method, url, data) {
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
function addlayer_handle(method, data) {
    return defalut_request(method, "http://8.129.180.37:8089/api/punctuate", data)
}
function select_addlayer(id = -1) {
    return defalut_request('get', `http://8.129.180.37:8089/api/punctuate/${id}`)
}
export { addlayer_handle, select_addlayer }