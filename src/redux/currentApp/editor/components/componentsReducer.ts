import { CaseReducer, PayloadAction } from "@reduxjs/toolkit"
import { cloneDeep } from "lodash"
import {
  ComponentNode,
  ComponentsState,
  DeleteComponentNodePayload,
  UpdateComponentPropsPayload,
} from "@/redux/currentApp/editor/components/componentsState"
import { searchDsl } from "@/redux/currentApp/editor/components/componentsSelector"
import { getNewWidgetPropsByUpdateSlice } from "@/utils/componentNode"
import { isObject } from "@/utils/typeHelper"

export const updateComponentReducer: CaseReducer<
  ComponentsState,
  PayloadAction<ComponentsState>
> = (state, action) => {
  return action.payload
}

export const copyComponentNodeReducer: CaseReducer<
  ComponentsState,
  PayloadAction<ComponentNode>
> = (state, action) => {}

export const addOrUpdateComponentReducer: CaseReducer<
  ComponentsState,
  PayloadAction<ComponentNode>
> = (state, action) => {
  const dealNode = action.payload
  if (state.rootDsl == null || dealNode.parentNode == null) {
    state.rootDsl = dealNode
  } else {
    const parentNode = searchDsl(state.rootDsl, dealNode.parentNode)
    if (parentNode != null) {
      if (parentNode.childrenNode == null) {
        parentNode.childrenNode = []
      }
      if (parentNode.childrenNode.includes(dealNode)) {
        parentNode.childrenNode.splice(
          parentNode.childrenNode.indexOf(dealNode),
          1,
        )
      } else {
        parentNode.childrenNode.push(dealNode)
      }
    }
  }
}

export const deleteComponentNodeReducer: CaseReducer<
  ComponentsState,
  PayloadAction<DeleteComponentNodePayload>
> = (state, action) => {
  const { displayName, parentDisplayName } = action.payload
  if (state.rootDsl == null) {
    return
  }
  const rootNode = state.rootDsl
  const parentNode = searchDsl(rootNode, parentDisplayName)
  if (parentNode == null) {
    return
  }
  const childrenNodes = parentNode.childrenNode
  if (childrenNodes == null) {
    return
  }
  childrenNodes.splice(
    childrenNodes.findIndex((value, index, obj) => {
      return value.displayName === displayName
    }),
    1,
  )
}

export const updateComponentPropsReducer: CaseReducer<
  ComponentsState,
  PayloadAction<UpdateComponentPropsPayload>
> = (state, action) => {
  const { displayName, updateSlice } = action.payload
  if (!isObject(updateSlice) || !displayName) {
    return
  }
  const node = searchDsl(state.rootDsl, displayName)
  if (!node) return
  const widgetProps = node.props || {}
  const clonedWidgetProps = cloneDeep(widgetProps)
  node.props = getNewWidgetPropsByUpdateSlice(
    displayName,
    updateSlice,
    clonedWidgetProps,
  )
}
