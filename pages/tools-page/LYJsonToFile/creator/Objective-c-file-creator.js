
var self = this;

//------------------------ 文件管理 拓展 ------------------------

/**
* 获取文件信息
*/
LYFileInfoMetaHandler.prototype.getFileInfoArrayForObjectiveC = function() {
	var className = this.modelInfoMeta.className;

	//.h文件
	var hFile = new LYFileInfoMeta(this.modelInfoMeta);
	hFile.extensionName = "h";
	this.updateImportTextForObjectiveC(hFile);
	hFile.defineStartText = usingConfigJSON.defineStartText ? usingConfigJSON.defineStartText : "";
	hFile.defineEndText = usingConfigJSON.defineEndText ? usingConfigJSON.defineEndText : "";
	hFile.classFooter = "@end";

	this.fileMetaUpdateClassNameForObjectiveC(hFile);

	var propertyTextArr = [];
	for (var i in this.modelInfoMeta.propertyInfoArray) {
		var propertyMeta = this.modelInfoMeta.propertyInfoArray[i];
		propertyMeta.getDefineContentTextForObjectiveC();
		propertyTextArr.push(propertyMeta.defineContentText);
	}
	hFile.propertyText = propertyTextArr.join("\n");
	hFile.getDetailInfoForObjectiveC();

	this.filesArray.push(hFile);

	//.m文件
	var mFile = new LYFileInfoMeta(this.modelInfoMeta);
	mFile.extensionName = "m";
	mFile.classFooter = "@end";
	this.fileMetaUpdateClassNameForObjectiveC(mFile);
	mFile.getDetailInfoForObjectiveC();

	this.filesArray.push(mFile);
};

/**
* 更新import信息
*/
LYFileInfoMetaHandler.prototype.updateImportTextForObjectiveC = function(fileMeta) {
	var notImportClassArray = usingConfigJSON.notImportClassArray;
	var importPropertyArr = this.modelInfoMeta.propertyInfoArray.filter(function(item) {
		return item.shouldImport == true && notImportClassArray.indexOf(item.propertyType) == -1;
	});
	var resultArr = [];
	if (importPropertyArr.length > 0) {
		
		var didAddClassArr = [];
		for (var i in importPropertyArr) {
			var p = importPropertyArr[i];
			var fileName = p.isContainer ? p.genericClassName : p.propertyType;
			if (didAddClassArr.indexOf(fileName) != -1) {
				continue;
			}
			var text = "#import \"" + fileName + ".h\"";
			resultArr.push(text);
			didAddClassArr.push(fileName);
		}
	}

	var importFileText = usingConfigJSON.defaultImportText ? usingConfigJSON.defaultImportText : "";
	if (importFileText) {
		resultArr.unshift(importFileText);
	}
	fileMeta.importFileText = resultArr.join("\n");
}

/**
* 更新className
*/
LYFileInfoMetaHandler.prototype.updateClassNameForObjectiveC = function() {
	for (var i in this.filesArray) {
		var fileMeta = this.filesArray[i];
		fileMeta.className = this.modelInfoMeta.className;
		this.fileMetaUpdateClassNameForObjectiveC(fileMeta);
	}
	//更新属性类型
	this.updateParentPropertyTypeForObjectiveC();
}

/**
* fileMeta更新关于className的信息
*/
LYFileInfoMetaHandler.prototype.fileMetaUpdateClassNameForObjectiveC = function(fileMeta) {
	if (fileMeta.extensionName == "h") {
		var parentClassName = usingConfigJSON.defaultParentClass ? usingConfigJSON.defaultParentClass : "NSObject";
		fileMeta.createdInfoText = this.getCreatedInfoTextForObjectiveC(fileMeta.extensionName);
		fileMeta.classHeader = "@interface " + fileMeta.className + " : " + parentClassName;
	} else if (fileMeta.extensionName == "m") {
		fileMeta.createdInfoText = this.getCreatedInfoTextForObjectiveC(fileMeta.extensionName);
		fileMeta.importFileText = "#import \"" + fileMeta.className + ".h\""
		fileMeta.classHeader = "@implementation " + fileMeta.className;
	}
	fileMeta.getDetailInfoForObjectiveC();
}

/**
* Class Name改变时，修改上一级的属性类型
*/
LYFileInfoMetaHandler.prototype.updateParentPropertyTypeForObjectiveC = function(fileMeta) {
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
				
				p.getDefineContentTextForObjectiveC();
			}
			//更新属性
			modelMeta.fileHandler.fileUpdatePropertyTypeForObjectiveC();
		}	
	}
}

/**
* 更新属性类型
*/
LYFileInfoMetaHandler.prototype.fileUpdatePropertyTypeForObjectiveC = function() {
	for (var i in this.filesArray) {
		var fileMeta = this.filesArray[i];
		if (fileMeta.extensionName == "h") {
			//更新导入文件
			this.updateImportTextForObjectiveC(fileMeta);
			var propertyTextArr = [];
			for (var i in this.modelInfoMeta.propertyInfoArray) {
				var propertyMeta = this.modelInfoMeta.propertyInfoArray[i];
				propertyMeta.getDefineContentTextForObjectiveC();
				propertyTextArr.push(propertyMeta.defineContentText);
			}
			fileMeta.propertyText = propertyTextArr.join("\n");
			fileMeta.getDetailInfoForObjectiveC();
		}
	}
}


/**
* 文件创建注释信息
*/
LYFileInfoMetaHandler.prototype.getCreatedInfoTextForObjectiveC = function(extensionName) {
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

LYFileInfoMeta.prototype.getDetailInfoForObjectiveC = function() {
	if (this.extensionName == "h") {
		this.classCompleteText = this.classHeader + "\n\n" + this.propertyText + "\n\n" + this.classFooter;
		this.fileCompleteText = this.createdInfoText + this.importFileText + "\n\n" + this.defineStartText + "\n\n" + this.classCompleteText + "\n\n" + this.defineEndText + "\n";
	} else if (this.extensionName == "m") {
		this.classCompleteText = this.classHeader + "\n\n" + this.classFooter;
		this.fileCompleteText = this.createdInfoText + this.importFileText + "\n\n" + this.classCompleteText + "\n";
	}
}


//------------------------ 属性meta 拓展 ------------------------

/**
* 获取对应语言生成的属性声明语句
*/

LYModelPropertyInfoMeta.prototype.getDefineContentTextForObjectiveC = function() {
	var pointerText = (this.pointerString && this.isPointer) ? this.pointerString : "";
	var genericText = (this.isContainer && this.showContainerGeneric && this.genericClassName.length > 0) ? ("<"+ this.genericClassName + " *>") : "";
	var propertyText = this.propertyType + genericText + " " + pointerText + this.name + ";";
	this.defineContentText = this.defineKeyword + " " + propertyText;
}


//------------------------ 设置所有class在同一个文件时 生成文件的内容 ------------------------

LYCreateFileContentForAllClassForObjectiveC = function(array) {

	var hClassArr = [];
	var mClassArr = [];
	var hRootFileMeta = {};
	var mRootFileMeta = {};
	var importFileArr = [];

	for (var i in array) {
		var objInfo = array[i];
		for (var j in objInfo.fileHandler.filesArray) {
			var info = objInfo.fileHandler.filesArray[j];
			if (info.extensionName == "h") {
				hClassArr.push(info.classCompleteText);
				if (objInfo.isRoot) {
					hRootFileMeta = info;
				} else {
					importFileArr.push(info.className);
				}
			} else {
				mClassArr.push(info.classCompleteText);
				if (objInfo.isRoot) {
					mRootFileMeta = info;
				}
			}
		}
	}

	//.h
	var defaultImportText = usingConfigJSON.defaultImportText ? usingConfigJSON.defaultImportText : "";
	var importFileText = "";
	var importFileTextSpace = "";
	if (importFileArr.length > 0) {
		importFileText = "@class " + importFileArr.join(", ") + ";";
		importFileTextSpace = "\n\n";
	}
	var hClassText = hClassArr.join("\n\n\n");
	var hFileText = hRootFileMeta.createdInfoText + defaultImportText + "\n\n" + hRootFileMeta.defineStartText + "\n\n" + importFileText + importFileTextSpace + hClassText + "\n\n" + hRootFileMeta.defineEndText; 

	var hFileInfo = {"fileName" : hRootFileMeta.className + ".h", "fileContent" : hFileText};

	//.m
	var mClassText = mClassArr.join("\n\n\n");
	var mFileText = mRootFileMeta.createdInfoText + mRootFileMeta.importFileText + "\n\n" + mClassText;

	var mFileInfo = {"fileName" : mRootFileMeta.className + ".m", "fileContent" : mFileText};

	return [hFileInfo, mFileInfo];
}