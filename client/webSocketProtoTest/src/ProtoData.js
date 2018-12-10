//Proto数据下载解析器
var ProtoData = cc.Class.extend({
    ctor : function(filename){
        var thisObj = this
        cc.loader.loadTxt((filename), function(err, data) {
            if (err) {
                console.log("ProtoData load " + filename + " failed");
                return;
            }
            //console.log("loaded: ",filename);
            thisObj.rootObj = protobuf.parse(data, { keepCase: true }).root;
        })
    },
    encode : function(proc, param){
        var obj = this.rootObj.lookup(proc)
        return obj.encode(param).finish()
    },
    decode : function(proc, buf){
        var obj = this.rootObj.lookup(proc);
        return obj.decode(buf)
    },
})



protobuf.encode = function(proc, obj,  protoData)
{
    var arr = proc.split(".")
    var data
    if("cs" == arr[0]){
        data = protoData
    }
    return data.encode(proc, obj)
}

protobuf.decode = function(proc, buf, protoData){
    var arr = proc.split(".")
    var data
    if("cs" == arr[0]){
        data = protoData
    }
    return data.decode(proc, buf)
}