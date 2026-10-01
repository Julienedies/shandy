/**
 *
 * Created by j on 2024/8/27.
 */

import '../../../css/common/common.scss'
import './style.scss'
import './index.html'

import $ from 'jquery'
import brick from '@julienedies/brick'
import '@julienedies/brick/dist/brick.css'

import '../../../js/utils.js'
import '../../../js/common-stock.js'

window.brick = brick;

brick.reg('replaysCtrl', function (scope) {

    let $elm = scope.$elm;

    let cla = 'shrink';
    let cla2 = 'expand';

    let date = brick.utils.getQuery('date');

    // 展开列表详细内容或收缩
    scope.toggle = function (e) {
        $elm.toggleClass(cla);
    };
    
    //
    scope.toggleLeft = function (e) {
        $elm.find('.cycle, .dayMark, .node').toggle();
    };

    scope.toggleTable = function (e) {
        console.log(this);
        $(this).toggleClass(cla2);
    };

    scope.toggleMsgBox = function (e) {
        $(this).toggleClass(cla);
    }

    // 编辑特定日期的复盘数据 replay
    scope.editReplayForDate = function (e, date) {
        let url = `/web/rp.html?date=${ date }`;
        window.open(url);
    };

    // 查看特定日期的复盘数据 replay
    scope.viewReplayForDate = function (e, date) {
        let url = `/web/stock_replay2.html?date=${ date }`;
        window.open(url);
    };

    //
    scope.filterByKey = function (e, key) {
        $elm.find('tr:not(:first-child)').not(`tr[tabindex=${ key }]`).toggle();
    };

    //
    $.get(`/stock/replay?date=${ date || '' }`).done((data) => {
        console.log(data);
        let arr = Array.isArray(data) ? data : [data];
        //arr = arr.slice(0, 100); 
        arr = arr.map((v) => {
            //return {date: v.date, '追踪方向': v['日内.资金方向']};
            return fixData(v);
        });
        
        //document.write('<pre>' + JSON.stringify(arr) + '</pre>');
                
        // deepseek code start
        
        const TRACK_START = '2026-02-02'; // 如需固定起点，改成 '2026-02-02'
        attachDirectionTable(arr, TRACK_START);
        
        // deepSeek code end 
         

        if( arr.length === 1) {
            $elm.removeClass(cla);
        }

        console.log(JSON.stringify(arr[0]));

        scope.render('replays', arr);
    });


    /*    $.get(url).done((data) => {
            console.log(data);
            let arr = data;
            //return console.log(arr);
            arr = arr.map((v) => {
                return fixData(v);
            });

            console.log(arr[0]);
            scope.render('replays', arr);
        });*/


    $elm.on('click', 'a.key', function (e) {
        let key = $(this).text();
        $elm.find('tr').not(`tr[tabindex=${ key }]`).toggle();
    });


    // 对复盘数据replay进行处理优化
    function fixData (rpForm) {
        let result = {};

        for (let i in rpForm) {

            let value = rpForm[i];

            let chain = i.split('.');

            (function fx (chain, result) {

                let k = chain.shift();

                let o = {};

                if (chain.length) {
                    o = result[k] = result[k] || o;
                    return fx(chain, o);
                }

                result[k] = value;

            })(chain, result);

        }
        result.week = window.getDayOfWeek(rpForm.date);
        console.log('replay fix => ', result);
        return result;
    }


    function _pushState (key, val) {
        let url = location.href;
        let url2 = url.split('?')[0];
        let o = brick.utils.getQuery() || {};
        o[key] = val;
        let s = '';
        for (let i in o) {
            s = s + i + '=' + o[i] + '&';
        }
        s = s.replace(/[&]$/img, '');
        history.pushState(null, null, `${ url2 }?${ s }`);
    }
    
    
    // deepSeek code start  
    
/* ============================================================
 * 构建方向追踪表
 * 规则：
 *  - 追踪期内列位置固定（对齐）
 *  - 连续 trackDays 天没出现 → 淘汰
 *  - 连续出现不足 minStreak 天就断了 → 淘汰
 *  - 淘汰后从列中移除，后面的方向往前补位
 *  - 淘汰时按 streak 降序重排（当下最有持续性的排前面）
 *  - 新方向追加到列末尾
 * ============================================================ */
function buildDirectionTable(dailyData, trackDays = 3, minStreak = 2) {
    const pool = new Map();      // 方向 -> { lastSeen, streak }
    let columns = [];            // 当前列顺序
    const rows = [];

    for (let day = 0; day < dailyData.length; day++) {
        const todaySet = new Set(dailyData[day]);

        // 1. 新方向追加到末尾
        for (const dir of todaySet) {
            if (!columns.includes(dir)) columns.push(dir);
        }

        // 2. 更新追踪池
        for (const dir of todaySet) {
            const item = pool.get(dir);
            if (item) {
                item.streak = item.lastSeen === day - 1 ? item.streak + 1 : 1;
                item.lastSeen = day;
            } else {
                pool.set(dir, { lastSeen: day, streak: 1 });
            }
        }

        // 3. 淘汰
        const removed = [];
        for (const [dir, item] of pool) {
            if (todaySet.has(dir)) continue;
            const gap = day - item.lastSeen;

            if (gap === 1 && item.streak < minStreak) {
                pool.delete(dir);
                removed.push(dir);
                continue;
            }
            if (gap >= trackDays) {
                pool.delete(dir);
                removed.push(dir);
            }
        }

        // 4. 有淘汰 → 移除列并重排
        if (removed.length) {
            columns = columns.filter((d) => !removed.includes(d));
            columns.sort((a, b) => {
                const ia = pool.get(a), ib = pool.get(b);
                if (!ia || !ib) return 0;
                if (ib.streak !== ia.streak) return ib.streak - ia.streak;
                return ib.lastSeen - ia.lastSeen;
            });
        }

        // 5. 生成这一行：只保留当前仍在追踪池里的方向
        const row = columns.map((dir) => {
            const item = pool.get(dir);
            if (item) {
                return {
                    name: dir,
                    flow: todaySet.has(dir) ? 1 : 0,
                    streak: item.streak,
                };
            }
            return { name: dir, flow: -1, streak: 0 };
        });

        rows.push({
            day: day + 1,
            columns: [...columns],
            row,
        });
    }

    return { rows };
}

/* ============================================================
 * 把计算结果附加到 replays 数组元素上（属性名 directionTable）
 * @param {Array}  replays     - fixData 后的数组（原始最新在前）
 * @param {number} trackDays   - 追踪天数，默认 3
 * @param {number} minStreak   - 最短连续天数，默认 2
 * @param {string} startDate   - 追踪起点，可选
 * ============================================================ */
function attachDirectionTable(replays, trackDays = 3, minStreak = 2, startDate = null) {
    // 1. 按日期升序（原始最新在前）
    let sorted = [...replays].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. 起点过滤（可选）
    if (startDate) {
        const startTs = new Date(startDate).getTime();
        sorted = sorted.filter((r) => new Date(r.date).getTime() >= startTs);
    }

    // 3. 提取每天的方向
    const dailyData = sorted.map((r) => {
        const dirs = r['日内'] && r['日内']['资金方向'];
        return Array.isArray(dirs) ? dirs : [];
    });

    // 4. 构建
    const { rows } = buildDirectionTable(dailyData, trackDays, minStreak);

    // 5. 按日期回填
    const byDate = new Map();
    rows.forEach((r, i) => {
        byDate.set(sorted[i].date, r);
    });

    replays.forEach((r) => {
        const t = byDate.get(r.date);
        r.directionTable = t ? t.row : [];
    });

    return replays;
}


// 版本 2

/* ============================================================
 * 第一步：追踪
 * 规则：
 *   - streak >= 3：断 3 天淘汰（容忍 2 天空档）
 *   - streak < 3：断 2 天淘汰（容忍 1 天空档）
 * ============================================================ */
function buildTracking(dailyData) {
    const pool = new Map();   // 方向 -> { lastSeen, streak }
    const rows = [];

    for (let day = 0; day < dailyData.length; day++) {
        const todaySet = new Set(dailyData[day]);

        // 更新追踪池
        for (const dir of todaySet) {
            const item = pool.get(dir);
            if (item) {
                item.streak = item.lastSeen === day - 1 ? item.streak + 1 : 1;
                item.lastSeen = day;
            } else {
                pool.set(dir, { lastSeen: day, streak: 1 });
            }
        }

        // 动态淘汰
        for (const [dir, item] of pool) {
            if (todaySet.has(dir)) continue;
            const gap = day - item.lastSeen;
            const dynamicTrackDays = item.streak >= 3 ? 3 : 2;
            if (gap >= dynamicTrackDays) pool.delete(dir);
        }

        // 输出今天在追踪池里的方向
        const row = [];
        for (const [dir, item] of pool) {
            row.push({
                name: dir,
                flow: todaySet.has(dir) ? 1 : 0,
                streak: item.streak,
            });
        }

        rows.push({ day: day + 1, row });
    }

    return rows;
}

/* ============================================================
 * 第二步：对齐（空位优先填充）
 * ============================================================ */
function alignRows(rows) {
    const aligned = [];
    let prevColumns = [];   // 前一天的槽位数组，'' 表示空位

    rows.forEach((r) => {
        const todayMap = new Map(r.row.map((it) => [it.name, it]));

        // 1. 继承前一天列顺序：今天没了 → 变空位
        const columns = prevColumns.map((name) => {
            if (name === '') return '';
            return todayMap.has(name) ? name : '';
        });

        // 2. 今天新出现 → 优先填最前面的空位，否则追加末尾
        const newDirs = r.row
            .map((it) => it.name)
            .filter((name) => !prevColumns.includes(name));

        for (const dir of newDirs) {
            const emptyIdx = columns.indexOf('');
            if (emptyIdx !== -1) columns[emptyIdx] = dir;
            else columns.push(dir);
        }

        // 3. 生成对齐后的行
        const alignedRow = columns.map((name) => {
            if (name === '') return { name: '', flow: -1, streak: 0 };
            return todayMap.get(name);
        });

        aligned.push({ day: r.day, row: alignedRow });
        prevColumns = columns;
    });

    return aligned;
}

/* ============================================================
 * 合并：计算并对齐
 * ============================================================ */
function buildDirectionTable(dailyData) {
    const tracking = buildTracking(dailyData);
    const aligned = alignRows(tracking);
    return aligned;
}

/* ============================================================
 * 把结果附加到 replays 数组元素上（属性名 directionTable）
 * @param {Array}  replays    - fixData 后的数组（原始最新在前）
 * @param {string} startDate  - 追踪起点，可选
 * ============================================================ */
function attachDirectionTable(replays, startDate = null) {
    // 1. 按日期升序
    let sorted = [...replays].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. 起点过滤
    if (startDate) {
        const startTs = new Date(startDate).getTime();
        sorted = sorted.filter((r) => new Date(r.date).getTime() >= startTs);
    }

    // 3. 提取每天的方向
    const dailyData = sorted.map((r) => {
        const dirs = r['日内'] && r['日内']['资金方向'];
        return Array.isArray(dirs) ? dirs : [];
    });

    // 4. 计算
    const aligned = buildDirectionTable(dailyData);

    // 5. 按日期回填
    const byDate = new Map();
    aligned.forEach((r, i) => {
        byDate.set(sorted[i].date, r.row);
    });

    replays.forEach((r) => {
			const row = byDate.get(r.date) || [];
			// 裁掉末尾连续空位
			let end = row.length;
			while (end > 0 && row[end - 1].name === "") end--;
			r.directionTable = row.slice(0, end);
		});

    return replays;
}


    // deepSeek code end 
    
    
    // call end 


});
