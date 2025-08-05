import { jsx as _jsx } from "react/jsx-runtime";
import { EuiButton } from '@elastic/eui';
export const MyEuiButton = ({ label }) => {
    return _jsx(EuiButton, { children: label });
};
