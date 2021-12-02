var currentLangue = "Swift"; //语言
var usingConfigJSON = LanguesConfigArray[0];

var objectArray = []; //object数组
var modelInfoArray = [];

var idCounter = 0;

var selectedLangueIndex = 0;

var modelNameHeader = "LS"; //默认model名字的前边部分
var modelNameFooter = "Model"; //默认model名字的后边部分
var projectName = "MiniFun"; //工程名称
var creator = "dopa"; //创建者
var organizationName = "vfun"; //组织、企业名称


/**
* model信息
*/
function LSModelInfoMeta(json, clsName) {

	idCounter++;
	var classId = idCounter;

	this.langue = currentLangue; //当前语言
	this.isRoot = false; //是否是根级（最外层）
	this.classId = classId; //class id
	this.className = clsName ? clsName : "LSModel"; //class 名称
	this.json = json; //对应的json
	this.propertyInfoArray = []; //属性信息，格式[LSModelPropertyInfoMeta对象]
	this.fileHandler = {}; //文件信息管理工具，WPFileInfoMetaHandler对象
	
	this.parentIds = []; //对应的上一级父类id集合，格式[1, 2]
	this.previousKeyJson = {}; //对应上一级的字段， 格式{父类id : ["父类属性名称1", "父类属性名称2"]}

	var self = this;

	/**
	* json解析
	*/
	this.parseJSON = function(json) {
		var properties = Object.getOwnPropertyNames(json);
		for (var i in properties) {
			var propertyName = properties[i]; //json属性名称
			var value = json[propertyName]; //json属性值
			
			var propertyMeta = new LSModelPropertyInfoMeta(propertyName, value);
			self.propertyInfoArray.push(propertyMeta);

			if (propertyMeta.constructorType == "object") {
				self.paresForObject(propertyMeta);
			} else if (propertyMeta.constructorType == "array") {
				if (propertyMeta.genericClassName == "object") { //Array里边是json(object)
					self.paresForObject(propertyMeta);
				}
			}
		}

		//文件信息
		self.fileHandler = new WPFileInfoMetaHandler(self);

	};

	/**
	* objetc处理
	*/
	this.paresForObject = function(propertyMeta) {
		var propertyName = propertyMeta.name;
		var value = propertyMeta.isContainer ? propertyMeta.value[0] : propertyMeta.value;
		
		propertyMeta.shouldImport = true;

		var exist = false;
		if (modelInfoArray.length > 0) {
			var existArr = modelInfoArray.filter(function(item) {
				return ObjectHasTheSameProperties(value, item.json);
			});
			exist = existArr.length > 0;
		}
		if (exist) {
			if (existArr[0].parentIds.indexOf(classId) == -1) {
				existArr[0].parentIds.push(classId);
			}
			if (existArr[0].previousKeyJson[classId]) {
				existArr[0].previousKeyJson[classId].push(propertyName);
			} else {
				existArr[0].previousKeyJson[classId] = [propertyName];
			}
			if (propertyMeta.isContainer) {
				propertyMeta.genericClassName = existArr[0].className;
			} else {
				propertyMeta.propertyType = existArr[0].className;
			}
			

		} else {
			//自定义class名称
			var clsName = "";
			if (usingConfigJSON.modelNameHeader || usingConfigJSON.modelNameFooter) {
				var clsNameHeader = usingConfigJSON.modelNameHeader ? usingConfigJSON.modelNameHeader : "";
				var clsNameFooter = usingConfigJSON.modelNameFooter ? usingConfigJSON.modelNameFooter : "";
				clsName = clsNameHeader + propertyName.WPFirstUpperCase() + clsNameFooter;
				
				if (propertyMeta.isContainer) {
					propertyMeta.genericClassName = clsName;
				} else {
					propertyMeta.propertyType = clsName;
				}
				
			}

			var modelMeta = new LSModelInfoMeta(value, clsName);

			modelMeta.parentIds.push(classId);
			if (modelMeta.previousKeyJson[classId]) {
				modelMeta.previousKeyJson[classId].push(propertyName);
			} else {
				modelMeta.previousKeyJson[classId] = [propertyName];
			}
			modelInfoArray.push(modelMeta);

		}
	}

	this.parseJSON(json);

}

/**
* model的属性信息
* json的key值
* json的valu值
*/
function LSModelPropertyInfoMeta(key, value) {
	this.name = key; //属性名称
	this.value = value; //属性值
	this.type = typeof value; //属性类型(JavaScript)
	this.constructorType = ""; //具体的类型
	this.isContainer = (value.constructor == Array || value.constructor == Set); //是否是容器

	//以下是对应语言model属性信息
	this.propertyType = ""; //对应语言的model属性类型
	this.isPointer = false; //是否是指针
	this.pointerString = usingConfigJSON.pointerString ? usingConfigJSON.pointerString : ""; //指针标记字符，OC里边为*
	this.defineKeyword = ""; //声明关键词
	this.genericClassName = ""; //泛型名称（只有容器才有）
	this.showContainerGeneric = usingConfigJSON.showContainerGeneric; //是否显示容器泛型
	this.shouldImport = false; //该类型是否需要导入文件

	this.defineContentText = ""; //对应语言生成的属性声明语句

	var self = this;

	/**
	* 根据json的key，value获取model的属性类型
	*/
	this.getModelPropertyType = function(propertyName, value) {
		var propertyType = "undefined"; //json属性类型
		var modelPropertyType = "undefined";
		var configPropertyJSON = usingConfigJSON.propertiesInfo;

		if (value != null) {
			propertyType = (typeof value);
			if (propertyType == "object") {
				if (value.constructor == Date) {
					propertyType = "date";
				} else if (value.constructor == Array) {
					propertyType = "array";
					//检查数组里边是否全是json
					var resultArr = value.filter(function(item) {
						var t = typeof item;
						return !(t == "object" && item.constructor == Object);
					});
					if (resultArr.length <= 0 && value.length > 0) { //Array里边是json(object)
						self.genericClassName = "object";
					} else if (value.length > 0) { //检查数组元素类型是否全部一致
						var c = value[0].constructor;
						resultArr = value.filter(function(item) {
							return item.constructor != c;
						});
						if (resultArr.length <= 0) {
							var tName = (typeof value[0]);
							self.genericClassName = configPropertyJSON[tName] ? configPropertyJSON[tName] : "";
						}
					}
				}
			} else if (propertyType == "number") {
				propertyType = Number.isInteger(value) ? "int" : "float";
			}
		}

		self.constructorType = propertyType;
		self.propertyType = configPropertyJSON[propertyType];
	}

	this.getModelPropertyType(key, value);

	//model属性信息获取
	var pointerTypes = usingConfigJSON.pointerTypes ? usingConfigJSON.pointerTypes : [];
	this.isPointer = pointerTypes.indexOf(this.propertyType) != -1; //是否是指针
	//声明关键词
	var keyword = usingConfigJSON.propertyKeywords.noramal;
	if (this.constructorType == "string") {
		keyword = usingConfigJSON.propertyKeywords.string ? usingConfigJSON.propertyKeywords.string : keyword;
	} else if (this.isPointer) {
		keyword = usingConfigJSON.propertyKeywords.pointer ? usingConfigJSON.propertyKeywords.pointer : keyword; 
	}
	this.defineKeyword = keyword;

}

/**
* 文件管理工具
*/
function WPFileInfoMetaHandler(modelInfoMeta) {
	this.modelInfoMeta = modelInfoMeta;
	this.filesArray = []; //文件信息数组，格式[WPFileInfoMeta对象]

	//下面将分发到各个语言的creator
	if (modelInfoMeta.langue == "ObjectiveC") {
		this.getFileInfoArrayForObjectiveC();
	} else if (modelInfoMeta.langue == "Swift") {
		this.getFileInfoArrayForSwift();
	} else if (modelInfoMeta.langue == "Java") {
		this.getFileInfoArrayForJava();
	}
 
	var self = this;
	/**
	*更新className
	*/
	this.updateClassName = function() {
		//下面将分发到各个语言的creator
		if (modelInfoMeta.langue == "ObjectiveC") {
			self.updateClassNameForObjectiveC();
		} else if (modelInfoMeta.langue == "Swift") {
			self.updateClassNameForSwift();
		} else if (modelInfoMeta.langue == "Java") {
			self.updateClassNameForJava();
		}
	}

}


/**
* 设置所有class在同一个文件时 生成文件的内容
*/

WPCreateFileContentForAllClass = function(array) {
	//下面将分发到各个语言的creator
	if (currentLangue == "ObjectiveC") {
		return WPCreateFileContentForAllClassForObjectiveC(array);
	} else if (currentLangue == "Swift") {
		return WPCreateFileContentForAllClassForSwift(array);
	} else if (currentLangue == "Java") {
		return WPCreateFileContentForAllClassForJava(array);
	} 
}


/**
* 文件信息
*/
function WPFileInfoMeta(modelInfoMeta) {
	this.modelInfoMeta = modelInfoMeta; //类信息

	this.extensionName = ""; //文件拓展名
	this.className = modelInfoMeta.className; //class 名称
	this.createdInfoText = ""; //文件创建的注释信息
	this.importFileText = ""; //导入文件信息
	this.defineStartText = ""; //宏定义开始
	this.classHeader = ""; //class开始
	this.propertyText = ""; //属性内容
	this.classFooter = ""; //class 结束
	this.defineEndText = ""; //宏定义结束

	this.classCompleteText = ""; //整个class的完整信息
	this.fileCompleteText = ""; //整个文件的完整信息

}

/**
* 根据json解析model的信息
*/
WPJSONParse = function(json) {
	if (json.constructor != Object) {
		this.vm.tipsText = "JSON格式不正确";
		return;
	}
	if (json.constructor == Array) {
		this.vm.tipsText = "JSON最外层不能为数组";
		return;
	} 

	idCounter = 0;
	modelInfoArray = [];
	// JSONPareToModelProperties(json, true);

	var modelMeta = new LSModelInfoMeta(json, modelNameHeader + modelNameFooter);
	modelMeta.isRoot = true;
	modelInfoArray.unshift(modelMeta);

	this.vm.modelInfoArray = modelInfoArray;
	console.log(modelInfoArray)
}

/**
* 判断两个对象是否相等
*/
ObjectIsEqual = function (obj1, obj2) {
	if (!(obj1 instanceof Object) || !(obj2 instanceof Object)) {
		return false;
	}
	var properties1 = Object.getOwnPropertyNames(obj1);
    var properties2 = Object.getOwnPropertyNames(obj2);
    if (properties1.length != properties2.length) {
        return false;
    }
    for (var i = 0, max = properties1.length; i < max; i++) {
        var propertyName = properties1[i];
        if (obj1[propertyName] !== obj2[propertyName]) {
            return false;
            break;
        }
    }
    return true;
}

/**
* 判断两个对象是否所有属性名称相同
*/
ObjectHasTheSameProperties = function (obj1, obj2) {
	if (!(obj1 instanceof Object) || !(obj2 instanceof Object)) {
		return false;
	}
	var properties1 = Object.getOwnPropertyNames(obj1);
    var properties2 = Object.getOwnPropertyNames(obj2);
    if (properties1.length != properties2.length) {
        return false;
    }
    var resultArray = properties1.filter(function(item) {
    	return properties2.indexOf(item) == -1;
    });
    return resultArray.length == 0;
    //判断是否拥有该属性 -> obj.hasOwnProperty("key")  //obj为json对象。
}

/**
* 属性数量相同
*/
ObjectPropertiesCountIsEqual = function (obj1, obj2) {
	var properties1 = Object.getOwnPropertyNames(obj1);
    var properties2 = Object.getOwnPropertyNames(obj2);
    return properties1.length == properties2.length
}

/**
* 求Object不一样的属性差集
* 返回json格式: {isContainer: 是否是包含关系, 
				containerIndex: 谁包含谁(0 - obj1包含obj2, 1 - obj2包含obj1),
				exceptArray: 差集数组}
*/
ObjectPropertiesExcept = function (obj1, obj2) {
	var properties1 = Object.getOwnPropertyNames(obj1);
    var properties2 = Object.getOwnPropertyNames(obj2);
    var resultArr1 = properties1.filter(function(item) {
    	return properties2.indexOf(item) == -1;
    });
	var resultArr2 = properties2.filter(function(item) {
		return properties1.indexOf(item) == -1;
	});  

	//1包含2
	var flag1 = resultArr1.length > 0 && resultArr2.length <= 0;
	//2包含1
	var falg2 = resultArr2.length > 0 && resultArr1.length <= 0;

	var isContainer = flag1 || falg2;
	var containerIndex = isContainer ? (flag1 ? 0 : 1) : -1;
	var exceptArray = isContainer ? (flag1 ? resultArr1 : resultArr2) : [];

	return {"isContainer" : isContainer, "containerIndex" : containerIndex, "exceptArray" : exceptArray};
}

const formatDate = function(date) {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return [year, month, day].map(formatNumber).join('/');
}

const formatNumber = function(n) {
	n = n.toString()
	return n[1] ? n : '' + n
}

/**
* 首字母大写
*/
String.prototype.WPFirstUpperCase = function() {
    return this.replace(/\b(\w)(\w*)/g,function($0,$1,$2){
      return $1.toUpperCase() + $2.toLowerCase();
    })
}
