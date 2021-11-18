const popup_data = {
    template: `
    <div class="popup">
        <p>{{layerdata.properties.popTitle}}</p>
        <p>id:{{layerdata.id}}</p>
        <p @click="test" style="width:200px">{{layerdata.properties.popupContent}}</p>
        <div>
            <a href="#">修改</a>
            <a href="#">删除</a>
        </div>
    </div>
    `,
    props:['layerdata'],
    methods: {
        test(){
            alert("1");
        }
    },
}
export { popup_data }