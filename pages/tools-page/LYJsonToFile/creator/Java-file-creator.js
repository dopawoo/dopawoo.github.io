

//------------------------ 文件管理 拓展 ------------------------

/**
* 获取文件信息
*/
LYFileInfoMetaHandler.prototype.getFileInfoArrayForJava = function() {
	var className = this.modelInfoMeta.className;

	var fileNeta = new LYFileInfoMeta(this.modelInfoMeta);
	fileNeta.extensionName = "java";
	fileNeta.importFileText = usingConfigJSON.defaultImportText ? usingConfigJSON.defaultImportText : "";
	fileNeta.classFooter = "}";

	this.fileMetaUpdateClassNameForJava(fileNeta);

	var propertyTextArr = [];
	for (var i in this.modelInfoMeta.propertyInfoArray) {
		var propertyMeta = this.modelInfoMeta.propertyInfoArray[i];
		propertyMeta.getDefineContentTextForJava();
		propertyTextArr.push(propertyMeta.defineContentText);
	}
	fileNeta.propertyText = propertyTextArr.join("\n");
	fileNeta.getDetailInfoForJava();

	this.filesArray.push(fileNeta);
}

/**
* 更新className
*/
LYFileInfoMetaHandler.prototype.updateClassNameForJava = function() {
	for (var i in this.filesArray) {
		var fileMeta = this.filesArray[i];
		fileMeta.className = this.modelInfoMeta.className;
		this.fileMetaUpdateClassNameForJava(fileMeta);
	}
	//更新属性类型
	this.updateParentPropertyTypeForJava();
}

/**
* fileMeta更新关于className的信息
*/
LYFileInfoMetaHandler.prototype.fileMetaUpdateClassNameForJava = function(fileMeta) {

	var parentClassName = usingConfigJSON.defaultParentClass ? usingConfigJSON.defaultParentClass : "";
	fileMeta.createdInfoText = this.getCreatedInfoTextForJava(fileMeta.extensionName);
	var parentClassNameText = parentClassName.length > 0 ? (" : " + parentClassName) : "";
	fileMeta.classHeader = "public class " + fileMeta.className + parentClassNameText + " {";

	fileMeta.getDetailInfoForJava();
}

/**
* Class Name改变时，修改上一级的属性类型
*/
LYFileInfoMetaHandler.prototype.updateParentPropertyTypeForJava = function(fileMeta) {
	if (!this.modelInfoMeta.isRoot) {
		var that = this;
		var modelInfoArray = self.vm.modelInfoArray.filter(function(item) {
			return that.modelInfoMeta.parentIds.indexOf(item.classId) != -1;
		});
		for (var i in modelInfoArray) {
			var modelMeta = modelInfoArray[i];
			var propertyArr = modelMeta.propertyInfoArray.filter(function(item) {
				return that.modelInfoMeta.previousKeyJson[modelMeta.classId].indexOf(item.name) != -1;
			});
			for (var j in propertyArr) {
				var p = propertyArr[j];
				if (p.isContainer) {
					p.genericClassName = this.modelInfoMeta.className;
				} else {
					p.propertyType = this.modelInfoMeta.className;
				}
				
				p.getDefineContentTextForJava();
			}
			//更新属性
			modelMeta.fileHandler.fileUpdatePropertyTypeForJava();
		}	
	}
}


/**
* 更新属性类型
*/
LYFileInfoMetaHandler.prototype.fileUpdatePropertyTypeForJava = function() {
	for (var i in this.filesArray) {
		var fileMeta = this.filesArray[i];
		var propertyTextArr = [];
		for (var i in this.modelInfoMeta.propertyInfoArray) {
			var propertyMeta = this.modelInfoMeta.propertyInfoArray[i];
			propertyMeta.getDefineContentTextForJava();
			propertyTextArr.push(propertyMeta.defineContentText);
		}
		fileMeta.propertyText = propertyTextArr.join("\n");
		fileMeta.getDetailInfoForJava();
	}
}

/**
* 文件创建注释信息
*/
LYFileInfoMetaHandler.prototype.getCreatedInfoTextForJava = function(extensionName) {
	if (!usingConfigJSON.writeCreatedInfo) {
		return "";
	}
	var className = this.modelInfoMeta.className;
	var date = new Date();
	var createdInfo = usingConfigJSON.createdInfo;
	var tabSpace = "  ";
	var createdText = "//\n//" + tabSpace + className + "." + extensionName + "\n//" + tabSpace + createdInfo.projectName + 
	"\n\n//" + tabSpace + "Created by " + createdInfo.creator + " on " + formatDate(date) + ".\n//" + tabSpace + 
	"Copyright © " + date.getFullYear() + " " + createdInfo.organizationName + ". All rights reserved." + "\n//\n\n";
	return createdText;
}


//------------------------ 文件信息 拓展 ------------------------

LYFileInfoMeta.prototype.getDetailInfoForJava = function() {
	this.classCompleteText = this.classHeader + "\n\n" + this.propertyText + "\n\n" + this.classFooter;
	this.fileCompleteText = this.createdInfoText + this.importFileText + "\n\n" + this.classCompleteText;
}

//------------------------ 属性meta 拓展 ------------------------

/**
* 获取对应语言生成的属性声明语句
*/

LYModelPropertyInfoMeta.prototype.getDefineContentTextForJava = function() {
	//容器泛型
	var genericOptionalsText = usingConfigJSON.setGenericOptionals ? "?" : ""; //Optionals
	var genericClassName = (this.isContainer && !this.genericClassName) ? "Object" : this.genericClassName;
	var genericText = this.isContainer ? ("<"+ genericClassName + genericOptionalsText + ">") : "";


	var propertyText = this.propertyType + genericText + " " + this.name;

	var space = "    ";
	var defineKeywordSpace = this.defineKeyword ? " " : "";
	this.defineContentText = space + this.defineKeyword + defineKeywordSpace + propertyText;

	//默认值
	var propertyDefaultValueSetting = usingConfigJSON.propertyDefaultValueSetting;
	var defaultValue = propertyDefaultValueSetting[this.constructorType];
	if (defaultValue != null) {
		this.defineContentText = this.defineContentText + " = " + defaultValue + ";";
	} else {
		this.defineContentText = this.defineContentText + ";";
	}
}

//------------------------ 设置所有class在同一个文件时 生成文件的内容 ------------------------

LYCreateFileContentForAllClassForJava = function(array) {
	var classArr = [];
	var rootFileMeta = {};

	for (var i in array) {
		var objInfo = array[i];
		for (var j in objInfo.fileHandler.filesArray) {
			var info = objInfo.fileHandler.filesArray[j];
			classArr.push(info.classCompleteText);
			if (objInfo.isRoot) {
				rootFileMeta = info;
			} 
		}
	}

	//文件内容
	var defaultImportText = usingConfigJSON.defaultImportText ? usingConfigJSON.defaultImportText : "";
	var importFileTextSpace = defaultImportText.length > 0 ? "\n\n" : "";
	

	var classText = classArr.join("\n\n\n");
	var fileText = rootFileMeta.createdInfoText + defaultImportText + importFileTextSpace + classText; 

	var fileInfo = {"fileName" : (rootFileMeta.className + "." + rootFileMeta.extensionName), "fileContent" : fileText};

	return [fileInfo];
}