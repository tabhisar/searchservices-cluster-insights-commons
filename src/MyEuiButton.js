"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyEuiButton = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const eui_1 = require("@elastic/eui");
const MyEuiButton = ({ label }) => {
    return (0, jsx_runtime_1.jsx)(eui_1.EuiButton, { children: label });
};
exports.MyEuiButton = MyEuiButton;
//# sourceMappingURL=MyEuiButton.js.map