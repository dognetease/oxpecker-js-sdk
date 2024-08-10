import { init_sync }  from './sdk-core';



try {
    init_sync();
} catch (error) {
    console.log(error);
}