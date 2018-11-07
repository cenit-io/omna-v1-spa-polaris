import React from 'react';
import {NomenclatureSelectBox} from "./NomenclatureSelectBox";

export class CategorySelectBox extends NomenclatureSelectBox {
    constructor(props) {
        super(props);

        this.state.entity = 'Category';
        this.state.idAttr = 'category_id';
        this.state.className = 'category-select-box';
    }
}