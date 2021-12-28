
LanguesConfigArray = [
	{
		langueName: "Swift",
		defaultParentClass: "", //默认父类
		defaultImportText: "import UIKit", //默认的导入文件信息
		modelNameHeader: "LS", //默认model名字的前边部分
		modelNameFooter: "Model", //默认model名字的后边部分
		allCLassInOneFile: false, //是否全部class在一个文件
		showContainerGeneric: true, //Swift没得选，语法规定。是否显示容器的泛型类型。例：true -> NSArray<NSObject>; false -> NSArray
		propertyKeywords: { //声明属性的关键词
			noramal: "var", //默认
		}, 
		propertiesInfo : {
			object: "NSObject",
			array: "Array",
			string : "String",
			number: "NSNumber",
			int: "Int",
			float: "CGFloat",
			boolean: "Bool",
			undefined: "undefined",
			date: "Date"
		},
		propertyDefaultValueSetting: { //属性默认值设置；为null时不设置，但是会设置为Optionals类型

		},
		propertyDefaultValueSettingTemplate: { //属性默认值设置；为null时不设置，但是会设置为Optionals类型
			string: "\"\"", //是否设置数值的默认值置string的默认值""
            number: 0, //是否设置数值的默认值
            int: 0,
            float: 0.0,
            array: "[]"
		},
		setGenericOptionals: false, //是否将容器泛型设置为Optionals
		setOptionalsForAll: false, //是否将所有类型都设置为Optionals
		createdInfo: { //创建信息
			projectName: "LSWorkshop", //工程名称
			creator: "dopa", //创建者
			organizationName: "vfun" //组织、企业名称
		},
		modelType: "class",
		conformingToHandyJSON: false //是否遵守HandyJSON
	},
	{
		langueName: "ObjectiveC",
		defaultParentClass: "NSObject", //默认父类
		defaultImportText: "#import <Foundation/Foundation.h>", //默认的导入文件信息
		notImportClassArray: ["NSObject", "undefined"], //不需要导入的class文件
		defineStartText: "NS_ASSUME_NONNULL_BEGIN", //宏定义开始
		defineEndText: "NS_ASSUME_NONNULL_END", //宏定义结束
		modelNameHeader: "LS", //默认model名字的前边部分
		modelNameFooter: "Model", //默认model名字的后边部分
		allCLassInOneFile: false, //是否全部class在一个文件
		showContainerGeneric: true, //是否显示容器的泛型类型。例：true -> NSArray<NSObject>; false -> NSArray
		propertyKeywords: { //声明属性的关键词
			noramal: "@property (nonatomic, assign)", //默认
			string: "@property (nonatomic, copy)", //字符
			pointer: "@property (nonatomic, strong)" //指针类型
		}, 
		propertiesInfo : { //JavaScript类型 - 对应语言的类型
			object: "NSObject",
			array: "NSArray",
			string : "NSString",
			number: "NSNumber",
			int: "NSInteger",
			float: "CGFloat",
			boolean: "BOOL",
			undefined: "undefined",
			date: "NSDate"
		},
		pointerTypes: ["NSString", "NSDate", "NSObject", "NSArray", "NSNumber"], //指针类型
		pointerString: "*" ,//用于指示指针的字符
		createdInfo: { //创建信息
			projectName: "LSWorkshop", //工程名称
			creator: "dopa", //创建者
			organizationName: "vfun" //组织、企业名称
		}
	},
	{
		langueName: "Java",
		defaultParentClass: "", //默认父类
		defaultImportText: "import java.util.ArrayList;", //package、import默认的导入文件信息
		modelNameHeader: "LS", //默认model名字的前边部分
		modelNameFooter: "Model", //默认model名字的后边部分
		allCLassInOneFile: false, //是否全部class在一个文件(Java好像不允许一个文件多个class，故只能为false)
		showContainerGeneric: true, //Swift没得选，语法规定。是否显示容器的泛型类型。例：true -> NSArray<NSObject>; false -> NSArray
		propertyKeywords: { //声明属性的关键词
			noramal: "", //默认 public
		}, 
		propertiesInfo : {
			object: "Object",
			array: "ArrayList", //import java.util.ArrayList;
			string : "String",
			number: "",
			int: "Integer",
			float: "Double",
			boolean: "Boolean",
			undefined: "undefined",
			date: "Date" //import java.util.Date;
		},
		propertyDefaultValueSetting: { //属性默认值设置；为null时不设置，但是会设置为Optionals类型
			string: "\"\"", //是否设置string的默认值""
			number: null, //是否设置数值的默认值
			// array: "[]"
		},
		setGenericOptionals: false, //是否将容器泛型设置为Optionals
		setOptionalsForAll: false, //是否将所有类型都设置为Optionals
		writeCreatedInfo: false, //是否写入创建信息
		createdInfo: { //创建信息
			projectName: "LSWorkshop", //工程名称
			creator: "dopa", //创建者
			organizationName: "vfun" //组织、企业名称
		}
	}
];

