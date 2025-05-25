/**
 *
 * Created by j on 2019-09-13.
 */

// 交易系统增删改查
export const ADD_SYSTEM = 'ADD_SYSTEM';
export const EDIT_SYSTEM = 'EDIT_SYSTEM';
export const SET_SYSTEM = 'SET_SYSTEM';
export const ON_SET_SYSTEM_DONE = 'ON_SET_SYSTEM_DONE'; // 废弃
export const SET_SYSTEM_DONE = 'SET_SYSTEM_DONE';

// 标签数据增删改查
export const ADD_TAG = 'tag.add';
export const EDIT_TAG = 'tag.edit';
export const SET_TAG = 'tag.edit';
export const DEL_TAG = 'DEL_TAG';

export const ON_SET_TAG_DONE = 'tag.edit.done';  // 废弃 start
export const ON_DEL_TAG_DONE = 'ON_DEL_TAG_DONE';  // 废弃 start

export const GET_TAGS_DONE = 'GET_TAGS_DONE';
export const SET_TAG_DONE = 'tag.edit.done';
export const ADD_TAG_DONE = 'ADD_TAG_DONE';
export const DEL_TAG_DONE = 'DEL_TAG_DONE';

export const TAGS_CHANGE = 'TAGS_CHANGE';

export const READY_SELECT_TAGS = 'READY_SELECT_TAGS';
// 标签集做为select change
export const TAG_SELECT_CHANGE = 'TAG_SELECT_CHANGE';


// 交易逻辑数据增删改查
export const ADD_LOGIC = 'LOGIC.add';
export const EDIT_LOGIC = 'LOGIC.edit';
export const SET_LOGIC = 'LOGIC.edit';
export const DEL_LOGIC = 'DEL_LOGIC';

export const GET_LOGIC_DONE = 'ON_GET_LOGIC_DONE';
export const ADD_LOGIC_DONE = 'ADD_LOGIC_DONE';
export const SET_LOGIC_DONE = 'LOGIC.edit.done';
export const DEL_LOGIC_DONE = 'ON_DEL_LOGIC_DONE';

export const ON_SET_LOGIC_DONE = 'LOGIC.edit.done'; // 废弃 start
export const ON_GET_LOGIC_DONE = 'ON_GET_LOGIC_DONE'; // 废弃 start
export const ON_DEL_LOGIC_DONE = 'ON_DEL_LOGIC_DONE'; // 废弃 start

// DIARY数据增删改查
export const ADD_DIARY = 'ADD_DIARY';
export const EDIT_DIARY = 'ADD_DIARY';
export const SET_DIARY = 'ADD_DIARY';
export const DEL_DIARY = 'ADD_DIARY';

export const GET_DIARY_DONE = 'GET_DIARY_DONE';
export const ADD_DIARY_DONE = 'ADD_DIARY_DONE';
export const SET_DIARY_DONE = 'SET_DIARY_DONE';
export const DEL_DIARY_DONE = 'DEL_DIARY_DONE';

// todo数据 ////////////////////////////////////////////////////////
export const SET_TODO = 'SET_TODO';
export const ADD_TODO = 'ADD_TODO';
export const EDIT_TODO = 'EDIT_TODO';
export const DEL_TODO = 'DEL_TODO';

export const GET_TODO_DONE = 'GET_TODO_DONE';
export const SET_TODO_DONE = 'SET_TODO_DONE';
export const DEL_TODO_DONE = 'DEL_TODO_DONE';

// rp
export const SET_RP = 'SET_RP';
export const SET_LINE = 'SET_LINE';


export const COLORS_BACKGROUND = ['#ffffff', '#ff0000', '#f60838', '#0000ff', '#03f2f2', '#006400', '#08f644', '#ffff00', '#9400D3', '#000000' ];
export let FroalaEditorConfig = {
    fontSizeDefaultSelection: '18',
    fontSize: ['14', '15', '16', '17', '18', '19', '20', '21', '22', '24', '26', '28', '30', '32'],
    colorsBackground: COLORS_BACKGROUND,
    colorsText: COLORS_BACKGROUND,
};

export default {
    ADD_SYSTEM,
    EDIT_SYSTEM,
    SET_SYSTEM,
    SET_SYSTEM_DONE,

    ADD_TAG,
    EDIT_TAG,
    SET_TAG,
    DEL_TAG,
    ADD_TAG_DONE,
    SET_TAG_DONE,
    DEL_TAG_DONE,
    GET_TAGS_DONE,

    READY_SELECT_TAGS,

    ADD_LOGIC,
    EDIT_LOGIC,
    SET_LOGIC,
    DEL_LOGIC,
    GET_LOGIC_DONE,
    ADD_LOGIC_DONE,
    SET_LOGIC_DONE,
    DEL_LOGIC_DONE,

    ADD_DIARY,
    EDIT_DIARY,
    SET_DIARY,
    DEL_DIARY,
    GET_DIARY_DONE,
    ADD_DIARY_DONE,
    SET_DIARY_DONE,
    DEL_DIARY_DONE,

    ADD_TODO,
    EDIT_TODO,
    SET_TODO,
    DEL_TODO,
    GET_TODO_DONE,
    SET_TODO_DONE,
    DEL_TODO_DONE,

    SET_RP,
    SET_LINE,

    COLORS_BACKGROUND,
    FroalaEditorConfig
}

