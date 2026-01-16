export type VNodeValue = string | number | boolean | null | undefined;

export interface VNode {
    tag: string | null;
    props: Record<string, any> | null;
    children: (VNode | string)[] | null;
    key: string | number | null;
    el: Node | null;
}

export const createVNode = (
    tag: string | null,
    props: Record<string, any> | null = null,
    children: (VNode | string)[] | null = null,
    key: string | number | null = null
): VNode => ({
    tag,
    props,
    children,
    key,
    el: null,
});
