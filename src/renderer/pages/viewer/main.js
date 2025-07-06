/*!
 * Created by j on 18/9/14.
 */

import "babel-polyfill";

import "./index.html";
import "../../css/common/common.scss";
import "./icViewer.scss";
import "./style.scss";

import brick from "@julienedies/brick";
import "@julienedies/brick/dist/brick.css";

import "../../js/common.js";

import fs from "fs";
import $ from "jquery";
import debugMenu from "debug-menu";

import userJo from "../../../libs/jsono-user";
import ju from "../../../libs/jodb-user";
import jd from "../../../libs/jodb-data";
import setting from "../../../libs/setting";
import utils from "../../../libs/utils";

import helper from "./helper";
import helper2 from "./helper2";
import backTop from "../../js/back-top";

import historyModel from "./historyModel";

import markTagCtrl from "./markTag-ctrl";
import listCtrl from "./list-ctrl";
import attachCtrl from "./attach-ctrl";

// activate context menu
debugMenu.install();

// 交易记录json
// const tradeArr = userJo('SEL', []).get();

const viewerJodb = ju("viewer", [], { key: "img" });
const tagsJodb = jd("tags");
const systemJodb = jd("system");

window.$ = $;
window.brick = brick;

window.TAGS_FILTER = [
	"交易错误",
	"交易统计",
	"交易风险",
	"行情类型",
	"目标行情",
	"行情驱动因素",
];

brick.services.reg("historyModel", historyModel);

brick.set("ic-viewer-interval", setting.get("viewer.interval") || 10);

brick.reg("mainCtrl", function (scope) {
	backTop();

	const historyModel = brick.services.get("historyModel");

	let $elm = scope.$elm;
	let $list = $("#list");
	let $imgDir = $("input[name=imgDir]");
	let $countShow;

	let isReverse = true; // 图片顺序反转
	let isRefresh = false; // 是否刷新
	let isOrigin = false; // 按图片原始时间排序
	let isFilterByMark = false; // 根据图片是否被标记进行过滤
	let filterInput = ""; // 过滤关键词

	let viewerCacheJo; // 针对目录的viewer tag 、system 数据
	let urlsByDayMap = {}; // 图片按日期分组map
	let viewDate; // 要查看的日期

	let tagsMap = {}; // 以tag id 为Key 生成 tags Map
	let systemMap = {}; // 以system id 为key 生成 system Map

	tagsJodb.each((item) => {
		tagsMap[item.id] = item;
	});
	systemJodb.each((item) => {
		systemMap[item.id] = item;
	});

	// 设置viewer播放间隔
	scope.setViewerInterval = function (e) {
		let val = $(this).val() * 1;
		brick.icViewer.set("interval", val);
		setting.refresh().set("viewer.interval", val);
		$.icMsg(val);
	};

	// 特定临时操作
	scope.ls = function () {
		if (confirm("确定此次临时操作？？？ 记得先备份数据，避免数据损坏！")) {
			//helper2.setTo(viewerJodb); // 更改热点系统
		}
	};

	// 检查viewer.json里包含的图片是否存在于文件系统，不存在的话删除viewer.json里的记录
	scope.clean = function (e) {
		let imgArr = viewerJodb.get();
		let resultArr = [];
		for (let i = 0; i < imgArr.length; i++) {
			let imgObj = imgArr[i];
			let imgPath = imgObj.img;
			if (!fs.existsSync(imgPath)) {
				resultArr.push(imgObj);
			}
		}

		if (resultArr.length) {
			if (
				confirm(
					`是否删除以下 ${resultArr.length} 项：\r\n ${JSON.stringify(
						resultArr,
						null,
						"\t"
					)}`
				)
			) {
				resultArr.forEach((imgObj, index) => {
					viewerJodb.remove(imgObj.img, "img");
				});
			}
			console.info("scope.clean", resultArr);
		} else {
			$.icMsg("没有错误图片记录.");
		}
	};

	// 刷新page
	scope.reload = function (e) {
		location.reload();
	};

	// 刷新目录缓存数据
	scope.refresh = function (e) {
		viewerJodb.refresh();
		isRefresh = true;
		isFilterByMark = false;
		filterInput = "";
		scope.init();
		setTimeout(() => {
			isRefresh = false;
		}, 200);
	};

	// 反转图片列表排序
	scope.reverse = function (e) {
		//scope.urls.reverse();
		//$list.icRender('list', scope.urls);
		isReverse = !isReverse;
		scope.init();
	};

	// 按原始顺序排序显示
	scope.toggleOrigin = function (e) {
		isOrigin = $(this).prop("checked");
		scope.init();
	};

	// 过滤图片是否已经标记
	scope.onFilterByMarked = function (e) {
		isFilterByMark = $(this).prop("checked");
		scope.init();
	};

	// 按照点击的tag过滤图片urls
	scope.onFilterByTag = function (e, tag) {
		console.log(tag);
		e.stopPropagation();
		filterInput = tag;
		$elm.find("#filterInput").val(tag);
		let urls = _filterByInput(scope.urls, filterInput);
		scope._init(urls);
	};

	// 根据输入的关键词过滤图片urls
	scope.onFilterByInput = function (e) {
		filterInput = $(this).val();
		if (filterInput) {
			let urls = _filterByInput(scope.urls, filterInput);
			scope._init(urls);
		} else {
			scope.init();
		}
	};

	scope.setFilterInput = function (e) {
		$(this).val("焦点or龙头or昨日or最近");
	};

	/**
	 * 根据输入的关键词过滤图片urls
	 * @param {Array} urls
	 * @param {String} filterInput
	 * @returns {Array}
	 */
	function _filterByInput(urls, filterInput) {
		String.prototype.J_includes = function (input) {
			let arr = input.split(/or/gim);
			for (let i = 0; i < arr.length; i++) {
				let val = arr[i];
				if (this.includes(val)) {
					return true;
				}
			}
		};

		return urls.filter((v, i) => {
			let a = [];
			let b = [];
			if (v.f.J_includes(filterInput)) {
				return true;
			}
			if (v.system.length) {
				a = v.system.filter((v) => {
					return v.name.J_includes(filterInput);
				});
				if (a.length) {
					return true;
				}
			}
			if (v.tags.length) {
				b = v.tags.filter((v) => {
					return v.text.J_includes(filterInput);
				});
				if (b.length) {
					return true;
				}
			}
		});
	}

	// 缓存viewer数据, 局部目录
	function bindViewerData(urls) {
		urls = urls || scope.urls;

		let cacheJson = viewerCacheJo.json;

		// 遍历，从本地缓存json里绑定交易、标签等数据， 如果本地缓存没有数据的话，从服务器json获取数据，并保存到本地json
		urls.forEach((o, i) => {
			// 附加标签信息 和 交易系统信息
			let f = o.f;
			let cacheKey = helper.getImgKey(f);
			let value = viewerCacheJo.get(cacheKey);

			// 貌似没有标记的img每次都要遍历, 好像不是，默认会存一个空{ tags: [], system: [] }，下次就是undefined
			if (!value) {
				value = {};
				let obj = viewerJodb.get2(f, "img") || { tags: [], system: [] };
				let arr = obj.tags || [];
				let arr2 = obj.system || [];

				value.tradeInfoText = obj.tradeInfo;

				value.tags = arr;

				value.system = arr2;

				//viewerCacheJo.set(cacheKey, obj); // 避免频繁读写文件，影响效率
				cacheJson[cacheKey] = value;
			}

			value.tags = value.tags || [];
			value.system = value.system || [];

			o.tradeInfoText = value.tradeInfo;
			o.tags = value.tags.map((v) => {
				return tagsMap[v];
			});
			o.system = value.system.map((v) => {
				return systemMap[v];
			});
		});

		viewerCacheJo.save();
	}

	// viewer mark change , 同时保存数据到相关目录
	scope.on("viewer-change", function (e, obj) {
		console.log("viewer-change", e, obj);
		//let cacheKey = helper.getImgKey(obj.img);
		//viewerCacheJo.set(cacheKey, obj);
		// 服务器端会更新
		setTimeout(() => {
			viewerCacheJo.refresh();
		}, 1000);
	});

	// viewer关闭后，因为markTag标签改变，需要更新urls数据
	scope.on("viewer-close", function () {
		bindViewerData(scope.urls);
		scope._init(scope.urls);
	});

	// 按单日分类图片
	function viewByDay(urls) {
		urlsByDayMap = {}; // 清空上次月份的单日数据
		urls.forEach((v, i) => {
			let d = v.d;
			let arr = (urlsByDayMap[d] = urlsByDayMap[d] || []);
			arr.push(v);
		});
		scope.render("viewByDay", { model: { map: urlsByDayMap, date: viewDate } });
	}

	// 点击后显示单日的股票
	scope.viewForDay = function (e, day) {
		viewDate = day;
		scope._init(urlsByDayMap[day]);
	};

	// 当查看日期选择改变
	scope.onChangeOfViewDay = function (msg) {
		console.log(msg);
		viewDate = msg.value;
		if (viewDate) {
			scope._init(urlsByDayMap[viewDate]);
		} else {
			scope._init();
		}
	};

	/**
	 *
	 * @param {*} [dir]
	 */
	scope.init = function (dir) {
		$.icSetLoading();
		// 为什么这里使用定时器？因为 $.icSetLoading
		setTimeout(() => {
			scope._init(dir);
			$.icClearLoading();
			isRefresh = false;
		}, 40);
	};

	/**
	 * 显示目录下图片列表
	 * @param [dir] {Array| String} 图片数组或图片目录路径
	 * @returns {Promise<*>}
	 * @private
	 */
	scope._init = async function (dir) {
		let urls;
		// 如果直接传递一个图片数组, 通常是查看某天图片
		if (Array.isArray(dir)) {
			urls = dir;
			console.log("init调用参数 传递了一个数组，而不是一个目录");
			console.log("urls =>", urls);
			scope.urls = urls;

		if (isOrigin && !viewDate) {
				viewByDay(urls);
			}
		} else {
			dir = dir || scope.imgDir;
			scope.imgDir = dir;
			if (!fs.existsSync(dir)) {
				return $.icMsg(`${dir}\r不存在!`);
			}
			$imgDir.val(dir);

			urls = helper.getImages(dir, { isReverse, isRefresh, isOrigin });

			viewerCacheJo = helper.getViewerCacheJo(dir);

			if (!urls.length) {
				return $.icMsg("no images.");
			}

			// 绑定附加viewer数据
			bindViewerData(urls);

			// 如果按是否标记对图片进行过滤
			if (isFilterByMark) {
				urls = urls.filter((v, i) => {
					return v.system.length || v.tags.length;
				});
			}

			// 如果有过滤关键词
			if (filterInput) {
				urls = _filterByInput(urls, filterInput);
			}

			console.log("urls =>", urls);
			scope.urls = urls;

			// 原始顺序模式下显示日列表
			// 需要清空上次的数据
			if (isOrigin) {
				viewByDay(urls); // 按单日分类图片
				if (viewDate) {
					urls = urlsByDayMap[viewDate];
					scope.urls = urls;
				}
			} else {
				urlsByDayMap = {}; // 清空上次月份的单日数据
				scope.render("viewByDay", { model: { map: {}, date: "" } });
			}

			setting.refresh().set("viewer.imgDir", dir);
		}

		$list.icRender("list", urls);
		$("#countShow").text(`共有 ${urls.length} 项.`);
	};

	// 图片目录路径选中后回调
	scope.onSelectImgDirDone = (dir) => {
		if (!dir) return;
		viewDate = undefined;
		scope.imgDir = dir;
		historyModel.add(dir);
		scope.init(dir);
	};

	// 图片剪切测试  fields => {x: 3140, y: 115, width: 310, height: 50}
	// scope.crop = {x: 3140, y: 115, width: 310, height: 50};
	// p2415q => {x: 3100, y: 117, width: 360, height: 50};
	// 328b => {x: 3200, y: 77, width: 190, height: 37};
	scope.cropTest = function (fields) {
		console.info(fields);
		let { x, y, width, height } = fields || scope.crop;
		let crop = (scope.crop = { x, y, width, height });
		let sn = $("#sn").val();
		let dataUrl = helper.crop(scope.urls[sn].f, fields);
		$("#view_crop").attr("src", dataUrl);
		setting.refresh().set("viewer.crop", crop);
	};

	// 图片列表重命名
	scope.ocrRename = function (e) {
		let $th = $(this);
		let $view_crop = $("#view_crop");
		let $ocr_text = $("#ocr_text");

		let that = this;

		let arr = scope.urls.map((o) => {
			return o.f;
		});

		let crop = scope.crop;

		if (!crop) {
			return alert("请先进行剪切测试!");
		}

		$(this).icSetLoading();

		helper.renameByOcr(arr, crop, (info) => {
			if (info) {
				$view_crop.attr("src", info.dataUrl);
				$ocr_text.text(info.words);
			} else {
				$th.icClearLoading();
				scope.init();
			}
		});
	};

	// 显示某个历史目录
	scope.show = function (e, dir) {
		//let $th = $(this).icSetLoading();
		dir = $(this).data("dir"); // 目录字符里包含 : , 所以没有使用事件参数
		scope.init(dir);
		/*        $.icSetLoading();
                setTimeout(() => {
                    scope.init(dir);
                    $.icClearLoading();
                }, 40);*/
		//$.icClearLoading();
		//$th.icClearLoading();
	};

	// 删除历史目录
	scope.remove = function (e, dir) {
		dir = $(this).data("dir");
		confirm("确认删除?") && historyModel.remove(dir);
	};

	// ------------------------------------------------------------------------------------------------

	historyModel.on("change", () => {
		scope.render("history", {
			model: { dirs: historyModel.get2(), dir: scope.imgDir },
		});
		setting.refresh().set("viewer.history", historyModel.get());
	});

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	// main 程序入口
	//////////////////////////////////////////////////////////////////////////////////////////////////////

	let imgDir = setting.get("viewer.imgDir");
	scope.imgDir = imgDir;

	historyModel.init(setting.get("viewer.history") || []);

	if (imgDir) {
		scope.init(imgDir);
	}

	scope.viewerVm = setting.get("viewer");
	scope.render("crop", { model: scope.viewerVm || {} }, () => {
		scope.$elm.find("#interval").val(scope.viewerVm.interval);
	});
});

brick.reg("viewerListCtrl", listCtrl);

brick.reg("viewerAttachCtrl", attachCtrl);

brick.reg("viewerMarkTagCtrl", markTagCtrl);
