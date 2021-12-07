import axios from 'axios'
import qs from 'qs'
//请求时间戳
function date_request() {
    return axios({
        method: 'get',
        url: "http://8.129.180.37:8089/api/ts/now"
    })
}
//登录
function login(username, password) {
    return axios({
        method: 'post',
        url: "http://8.129.180.37:8089/api/oauth/token?grant_type=password",
        headers: { 'Authorization': `Basic YXBwOmFwcA==`, "Content-Type": "application/x-www-form-urlencoded" },
        data: qs.stringify({
            username: 'admin',
            password: '6beb345ba9ae4c4802e42852e2bd4dde364e0979b87b444f201238289f58dc37ab3ba1070921212032e8f4238a53da70035b01c6a48d3fa08b96fd6cd3152ec5'
        })
    })
}
//刷新登录token
function refresh_token(token) {
    return axios({
        method: 'post',
        url: `http://8.129.180.37:8089/api/oauth/token?refresh_token=${token}&grant_type=refresh_token`,
        headers: { 'Authorization': `Basic YXBwOmFwcA==`, "Content-Type": "application/x-www-form-urlencoded" },
    })
}
export { date_request, login, refresh_token }