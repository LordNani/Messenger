import {IPasswordChange, IProfileEdit, IUserSearchDto} from "./userModels";
import apiClient from "../apiClient";
import tokenService from "../token/tokenService";

const userService = {

    search: async (username: string): Promise<IUserSearchDto> => {
        const params = new URLSearchParams();
        params.append('username', username);
        const response = await apiClient.get(`/api/users/search?${params.toString()}`);
        return response.data.data;
    },

    editProfile: async (request: IProfileEdit): Promise<void> => {
        await apiClient.post(`/api/users/update-profile`, request);
    },

    changePassword: async (request: IPasswordChange): Promise<void> => {
        const response = await apiClient.post(`/api/users/change-password`, request);
        const {accessToken, refreshToken} = response.data.data;
        tokenService.setTokens(accessToken, refreshToken);
    },
};

export default userService;
