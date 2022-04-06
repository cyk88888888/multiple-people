
import { Color, Component, MeshRenderer, Node, Vec3, _decorator } from 'cc';
import { MathUtil } from '../../scripts/models/MathUtil';
import { gameConfig } from '../../scripts/shared/game/gameConfig';
import { ArrowState } from '../../scripts/shared/game/state/ArrowState';
const { ccclass, property } = _decorator;

const ARROW_TOP = 7;

@ccclass('Arrow')
export class Arrow extends Component {

    id!: number;
    state!: ArrowState;

    @property(Node)
    arrow!: Node;
    @property(Node)
    circle!: Node;

    // 开始位置（场景坐标）
    private _startPos = new Vec3;
    // 落点位置（场景坐标）
    private _endPos = new Vec3;
    // 开始时间（场景时间）
    private _startTime = 0;
    // 结束时间（场景时间）
    private _endTime = 0;

    init(state: ArrowState, startPos: Vec3, now: number) {
        this.id = state.id;
        this.state = state;
        this._startPos.set(startPos);
        this._endPos.set(state.targetPos.x, 0, -state.targetPos.y);
        this._startTime = Date.now();
        // 箭的展示与判定相分离，展示就按固定的飞行时长展示
        this._endTime = this._startTime + gameConfig.arrowFlyTime;

        this._updatePosAndForward(0);
        this.circle.setPosition(this._endPos.x, 0.1, this._endPos.z);
        this.circle.getComponent(MeshRenderer)?.material!.setProperty('mainColor', new Color(255, 255, 255, 255));
    }

    update() {
        //下一个目标位置
        let percent = MathUtil.limit((Date.now() - this._startTime) / (this._endTime - this._startTime), 0, 1);
        this._updatePosAndForward(percent);

        if (percent >= 1) {
            this.remove();
        }
    }

    private _isRemoved = false;
    remove() {
        if (this._isRemoved) {
            return;
        }
        this._isRemoved = true;

        this.circle.getComponent(MeshRenderer)?.material!.setProperty('mainColor', new Color(255, 0, 0, 255));

        // 落地 1 秒后消失
        this.scheduleOnce(() => {
            this.node.removeFromParent()
        }, 1)
    }

    private _updatePosAndForward(percent: number) {
        let nextPos = this._getPos(percent);
        this.arrow.position = nextPos;

        //武器朝向下一个目标位置, 形成曲线飞行的感觉
        let lastPos = this._getPos(percent - 0.01)
        this.arrow.forward = nextPos.clone().subtract(lastPos).normalize();
    }

    private _getPos(percent: number) {
        let pos = this._startPos.clone().lerp(this._endPos, percent)
        pos.y = ARROW_TOP * Math.cos(percent * Math.PI - Math.PI / 2);
        return pos;
    }
}